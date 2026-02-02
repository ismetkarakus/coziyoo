# SQLite3 Upgrade Plan

This document outlines the plan to migrate the application's data storage from the current in-memory Mock Firestore to a persistent SQLite3 database.

## 1. Current System Analysis

Before proceeding with the upgrade, it is important to understand how the current backend operates.

### How the Backend Works
Currently, the application **does not use a real backend server**. Instead, it uses a **Mock Firestore Adapter** located in `src/services/backend/firestore.ts`. This adapter mimics the Firebase Firestore API (e.g., `collection`, `doc`, `addDoc`, `getDocs`) but operates entirely within the client application.

### API Requests
There are **no network API requests** being made for data operations.
*   When a service (e.g., `FoodService`) needs data, it calls a function from `firestore.ts`.
*   These function calls return Promises that resolve immediately (or with a slight delay if simulated) with the requested data.
*   The "API" is effectively a set of local JavaScript functions acting as a database interface.

### Data Storage
Data is currently stored **in-memory** in a JavaScript object variable named `mockDbData` inside `src/services/backend/firestore.ts`.
*   **Volatile**: Because it is stored in a standard variable, **all data is lost when the application is reloaded or restarted**.
*   **Structure**: The data is organized into "collections" (users, foods, etc.) which contain "documents" (individual items), mirroring a NoSQL structure.

**Why Migrate to SQLite?**
Moving to SQLite will provide **persistent local storage**. Data will be saved to a file on the device's filesystem, ensuring it survives app restarts and allowing for a fully functional offline-first application.

## 2. Overview

The goal is to provide local persistence for the application using SQLite. This involves:
1.  Installing `expo-sqlite`.
2.  Designing the database schema to match existing data models.
3.  Creating a database initialization script.
4.  Replacing the current mock Firestore adapter (`src/services/backend/firestore.ts`) with a SQLite-based implementation or updating services to use SQLite directly.

## 2. Dependencies

Install the necessary package:
```bash
npx expo install expo-sqlite
```

## 3. Database Schema

The following tables will be created to replace the existing collections:

### Users Table (`users`)
| Column | Type | Description |
|--------|------|-------------|
| uid | TEXT PRIMARY KEY | User ID |
| email | TEXT | Email address |
| displayName | TEXT | Display Name |
| userType | TEXT | 'buyer', 'seller', or 'both' |
| password | TEXT | Hashed password (for local auth) |
| createdAt | TEXT | ISO Date string |
| updatedAt | TEXT | ISO Date string |

### Foods Table (`foods`)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Food ID |
| name | TEXT | Food Name |
| description | TEXT | Description |
| price | REAL | Price |
| cookName | TEXT | Cook Name |
| cookId | TEXT | Seller ID |
| category | TEXT | Category |
| imageUrl | TEXT | Image URL |
| ingredients | TEXT | JSON string of ingredients |
| preparationTime | INTEGER | Minutes |
| servingSize | INTEGER | Servings |
| isAvailable | INTEGER | Boolean (0 or 1) |
| rating | REAL | Average Rating |
| reviewCount | INTEGER | Total Reviews |
| createdAt | TEXT | ISO Date string |
| updatedAt | TEXT | ISO Date string |

### Orders Table (`orders`)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Order ID |
| foodId | TEXT | Foreign Key to Foods |
| buyerId | TEXT | Foreign Key to Users |
| sellerId | TEXT | Foreign Key to Users |
| quantity | INTEGER | Quantity ordered |
| totalPrice | REAL | Total cost |
| status | TEXT | Order status |
| deliveryAddress | TEXT | Delivery Address |
| orderDate | TEXT | ISO Date string |
| estimatedDeliveryTime | TEXT | ISO Date string |

### Chats Table (`chats`)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Chat ID |
| buyerId | TEXT | Buyer ID |
| buyerName | TEXT | Buyer Name |
| sellerId | TEXT | Seller ID |
| sellerName | TEXT | Seller Name |
| orderId | TEXT | Order ID (Optional) |
| foodId | TEXT | Food ID (Optional) |
| foodName | TEXT | Food Name |
| lastMessage | TEXT | Last message text |
| lastMessageTime | TEXT | ISO Date string |
| lastMessageSender | TEXT | Sender ID |
| buyerUnreadCount | INTEGER | Count |
| sellerUnreadCount | INTEGER | Count |
| isActive | INTEGER | Boolean (0 or 1) |
| createdAt | TEXT | ISO Date string |

### Messages Table (`messages`)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Message ID |
| chatId | TEXT | Foreign Key to Chats |
| senderId | TEXT | Sender ID |
| senderName | TEXT | Sender Name |
| senderType | TEXT | 'buyer' or 'seller' |
| message | TEXT | Message content |
| messageType | TEXT | 'text', 'image', 'order_update' |
| timestamp | TEXT | ISO Date string |
| isRead | INTEGER | Boolean (0 or 1) |
| orderData | TEXT | JSON string |

### Reviews Table (`reviews`)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | Review ID |
| foodId | TEXT | Foreign Key to Foods |
| foodName | TEXT | Food Name |
| buyerId | TEXT | Buyer ID |
| buyerName | TEXT | Buyer Name |
| buyerAvatar | TEXT | Avatar URL |
| sellerId | TEXT | Seller ID |
| sellerName | TEXT | Seller Name |
| orderId | TEXT | Order ID |
| rating | REAL | Rating (1-5) |
| comment | TEXT | Review comment |
| images | TEXT | JSON string of image URLs |
| helpfulCount | INTEGER | Count |
| reportCount | INTEGER | Count |
| isVerifiedPurchase | INTEGER | Boolean (0 or 1) |
| createdAt | TEXT | ISO Date string |
| updatedAt | TEXT | ISO Date string |

## 4. Implementation Strategy

### Step 1: Database Initialization Service
Create `src/services/backend/sqlite.ts` to handle database connection and table creation. This file will export a `db` instance and helper functions similar to the current `firestore.ts` to minimize refactoring impact, OR a cleaner standardized DB interface.

**Recommended Approach:** Implement a `DatabaseService` class in `src/services/backend/dbService.ts` that wraps SQLite operations.

```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('coziyoo.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, email TEXT, displayName TEXT, userType TEXT, password TEXT, createdAt TEXT, updatedAt TEXT);
    CREATE TABLE IF NOT EXISTS foods (id TEXT PRIMARY KEY, name TEXT, description TEXT, price REAL, cookName TEXT, cookId TEXT, category TEXT, imageUrl TEXT, ingredients TEXT, preparationTime INTEGER, servingSize INTEGER, isAvailable INTEGER, rating REAL, reviewCount INTEGER, createdAt TEXT, updatedAt TEXT);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, foodId TEXT, buyerId TEXT, sellerId TEXT, quantity INTEGER, totalPrice REAL, status TEXT, deliveryAddress TEXT, orderDate TEXT, estimatedDeliveryTime TEXT);
    CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, buyerId TEXT, buyerName TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, foodId TEXT, foodName TEXT, lastMessage TEXT, lastMessageTime TEXT, lastMessageSender TEXT, buyerUnreadCount INTEGER, sellerUnreadCount INTEGER, isActive INTEGER, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, chatId TEXT, senderId TEXT, senderName TEXT, senderType TEXT, message TEXT, messageType TEXT, timestamp TEXT, isRead INTEGER, orderData TEXT);
    CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, foodId TEXT, foodName TEXT, buyerId TEXT, buyerName TEXT, buyerAvatar TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, rating REAL, comment TEXT, images TEXT, helpfulCount INTEGER, reportCount INTEGER, isVerifiedPurchase INTEGER, createdAt TEXT, updatedAt TEXT);
  `);
};
```

### Step 2: Adapting Services
The existing services (`authService`, `foodService`, etc.) currently import `doc`, `collection`, `addDoc`, etc., from `backend/firestore.ts`.

We have two options:
1.  **Refactor `backend/firestore.ts`**: Rewrite the functions in this file to use SQLite under the hood. This preserves the existing service code but might be leaky (e.g., SQLite doesn't have "collections" in the same way).
2.  **Refactor Services**: Update each service to use the new `dbService.ts` directly. This is cleaner and more performant.

**Decision**: **Refactor Services**. It provides a proper abstraction and cleaner code.

### Step 3: Migration Sequence
1.  Initialize SQLite DB in `app/_layout.tsx` or a dedicated provider.
2.  Update `authService.ts` to read/write users from SQLite.
3.  Update `foodService.ts` for CRUD on foods.
4.  Update `orderService.ts` (if it exists, or wherever orders are handled).
5.  Update `chatService.ts` and `reviewService.ts`.

## 6. How to Test

To verify that the SQLite database and Routed API are working correctly:

### 1. Persistence Test (The most important)
1.  Open the app and **Register** a new account.
2.  **Close the app completely** (Kill the process on your phone or emulator).
3.  **Restart the app** (`npm run ios` or `npm run android`).
4.  Try to **Sign In** with the account you just created.
5.  If you can log in, **persistence is working** (previously, data would be lost on restart).

### 2. Log Verification
Check your terminal logs (where Expo is running). You should see:
- `[Internal API] POST /auth/register`
- `[Internal API] POST /auth/login`
- `Database initialized successfully`

### 3. Debugging queries
If you want to see exactly what is in the database, you can add this snippet to any screen (e.g., `app/(tabs)/index.tsx`):
```typescript
import { getDB } from '../src/api/utils/db';

const checkDB = async () => {
  const db = getDB();
  const users = await db.getAllAsync('SELECT * FROM users');
  console.log('Registered Users:', users);
};
```

### 4. CRUD Verification
Go to the "Add Meal" section as a seller:
1. Add a meal.
2. Go to the "Explore" tab.
3. If the meal appears there and survives an app restart, the `foods` table is working correctly.
