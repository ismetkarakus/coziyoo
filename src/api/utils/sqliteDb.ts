import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

interface DBInterface {
  execSync(sql: string): void;
  getAllAsync(sql: string, params?: any[]): Promise<any[]>;
  getFirstAsync(sql: string, params?: any[]): Promise<any | null>;
  runAsync(sql: string, params?: any[]): Promise<any>;
}

const DATABASE_NAME = 'coziyoo-test.db';

let sqliteDb: SQLiteDatabase | null = null;

const getDatabase = (): SQLiteDatabase => {
  if (!sqliteDb) {
    sqliteDb = openDatabaseSync(DATABASE_NAME);
  }
  return sqliteDb;
};

const createSchema = (db: SQLiteDatabase): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      fullName TEXT,
      displayName TEXT,
      username TEXT,
      phone TEXT,
      birthDate TEXT,
      gender TEXT,
      avatarUri TEXT,
      addressLine1 TEXT,
      city TEXT,
      postcode TEXT,
      allergicTo TEXT,
      paymentCards TEXT,
      sellerNickname TEXT,
      sellerLocation TEXT,
      sellerAddress TEXT,
      sellerDescription TEXT,
      sellerDeliveryDistance TEXT,
      sellerSpecialties TEXT,
      identityFrontImage TEXT,
      identityBackImage TEXT,
      identityStatus TEXT,
      identitySubmittedAt TEXT,
      identityVerifiedAt TEXT,
      identityRejectionReason TEXT,
      bankName TEXT,
      bankAccountHolderName TEXT,
      bankIban TEXT,
      bankAccountNumber TEXT,
      complianceCouncilRegistered INTEGER,
      complianceHygieneCertificate INTEGER,
      complianceAllergensDeclared INTEGER,
      complianceHygieneRating INTEGER,
      complianceInsurance INTEGER,
      complianceTermsAccepted INTEGER,
      complianceApproved INTEGER,
      complianceData TEXT,
      userType TEXT,
      password TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      cookName TEXT,
      cookId TEXT,
      category TEXT,
      imageUrl TEXT,
      ingredients TEXT,
      extraData TEXT,
      preparationTime INTEGER,
      servingSize INTEGER,
      isAvailable INTEGER,
      rating REAL,
      reviewCount INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      foodId TEXT NOT NULL,
      foodName TEXT,
      cookName TEXT,
      cookId TEXT,
      buyerId TEXT NOT NULL,
      buyerName TEXT,
      sellerId TEXT NOT NULL,
      quantity INTEGER,
      price REAL,
      totalPrice REAL,
      deliveryType TEXT,
      requestedDate TEXT,
      requestedTime TEXT,
      status TEXT,
      trackingStatus TEXT,
      deliveryAddress TEXT,
      paymentCompleted INTEGER,
      buyerApprovedAt TEXT,
      sellerApprovedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      orderDate TEXT,
      estimatedDeliveryTime TEXT
    );

    CREATE TABLE IF NOT EXISTS wallets (
      userId TEXT PRIMARY KEY NOT NULL,
      data TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY NOT NULL,
      buyerId TEXT NOT NULL,
      buyerName TEXT,
      sellerId TEXT NOT NULL,
      sellerName TEXT,
      orderId TEXT,
      foodId TEXT,
      foodName TEXT,
      lastMessage TEXT,
      lastMessageTime TEXT,
      lastMessageSender TEXT,
      buyerUnreadCount INTEGER,
      sellerUnreadCount INTEGER,
      isActive INTEGER,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      chatId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      senderName TEXT,
      senderType TEXT,
      message TEXT,
      messageType TEXT,
      timestamp TEXT,
      isRead INTEGER,
      orderData TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY NOT NULL,
      foodId TEXT NOT NULL,
      foodName TEXT,
      buyerId TEXT NOT NULL,
      buyerName TEXT,
      buyerAvatar TEXT,
      sellerId TEXT NOT NULL,
      sellerName TEXT,
      orderId TEXT,
      rating REAL,
      comment TEXT,
      images TEXT,
      helpfulCount INTEGER,
      reportCount INTEGER,
      isVerifiedPurchase INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_foods_cookId ON foods(cookId);
    CREATE INDEX IF NOT EXISTS idx_orders_buyerId ON orders(buyerId);
    CREATE INDEX IF NOT EXISTS idx_orders_sellerId ON orders(sellerId);
    CREATE INDEX IF NOT EXISTS idx_chats_buyerId ON chats(buyerId);
    CREATE INDEX IF NOT EXISTS idx_chats_sellerId ON chats(sellerId);
    CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
    CREATE INDEX IF NOT EXISTS idx_reviews_foodId ON reviews(foodId);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);
};

const migrateUserSchema = (db: SQLiteDatabase): void => {
  const userColumns = [
    'fullName TEXT',
    'username TEXT',
    'phone TEXT',
    'birthDate TEXT',
    'gender TEXT',
    'avatarUri TEXT',
    'addressLine1 TEXT',
    'city TEXT',
    'postcode TEXT',
    'allergicTo TEXT',
    'paymentCards TEXT',
    'sellerNickname TEXT',
    'sellerLocation TEXT',
    'sellerAddress TEXT',
    'sellerDescription TEXT',
    'sellerDeliveryDistance TEXT',
    'sellerSpecialties TEXT',
    'identityFrontImage TEXT',
    'identityBackImage TEXT',
    'identityStatus TEXT',
    'identitySubmittedAt TEXT',
    'identityVerifiedAt TEXT',
    'identityRejectionReason TEXT',
    'bankName TEXT',
    'bankAccountHolderName TEXT',
    'bankIban TEXT',
    'bankAccountNumber TEXT',
    'complianceCouncilRegistered INTEGER',
    'complianceHygieneCertificate INTEGER',
    'complianceAllergensDeclared INTEGER',
    'complianceHygieneRating INTEGER',
    'complianceInsurance INTEGER',
    'complianceTermsAccepted INTEGER',
    'complianceApproved INTEGER',
    'complianceData TEXT',
  ];

  userColumns.forEach((columnDef) => {
    try {
      db.execSync(`ALTER TABLE users ADD COLUMN ${columnDef};`);
    } catch (_error) {
      // Column already exists in existing installations.
    }
  });

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
  db.execSync(`
    UPDATE users
    SET fullName = COALESCE(NULLIF(trim(fullName), ''), displayName)
    WHERE fullName IS NULL OR trim(fullName) = '';
  `);
  db.execSync(`
    UPDATE users
    SET username = (
      CASE WHEN userType = 'buyer' THEN 'buyer_' ELSE 'seller_' END
      || lower(replace(trim(COALESCE(displayName, 'user')), ' ', '-'))
    )
    WHERE username IS NULL OR trim(username) = '';
  `);
};

const migrateOrderAndWalletSchema = (db: SQLiteDatabase): void => {
  const orderColumns = [
    'foodName TEXT',
    'cookName TEXT',
    'cookId TEXT',
    'buyerName TEXT',
    'price REAL',
    'deliveryType TEXT',
    'requestedDate TEXT',
    'requestedTime TEXT',
    'trackingStatus TEXT',
    'paymentCompleted INTEGER',
    'buyerApprovedAt TEXT',
    'sellerApprovedAt TEXT',
    'createdAt TEXT',
    'updatedAt TEXT',
  ];

  orderColumns.forEach((columnDef) => {
    try {
      db.execSync(`ALTER TABLE orders ADD COLUMN ${columnDef};`);
    } catch (_error) {
      // Column already exists.
    }
  });

  db.execSync(`
    CREATE TABLE IF NOT EXISTS wallets (
      userId TEXT PRIMARY KEY NOT NULL,
      data TEXT,
      updatedAt TEXT
    );
  `);
};

const migrateFoodSchema = (db: SQLiteDatabase): void => {
  const foodColumns = ['extraData TEXT'];
  foodColumns.forEach((columnDef) => {
    try {
      db.execSync(`ALTER TABLE foods ADD COLUMN ${columnDef};`);
    } catch (_error) {
      // Column already exists.
    }
  });
};

const seedIfEmpty = (db: SQLiteDatabase): void => {
  // DB-only mode: do not auto-seed from local mock data.
  // Initial records must come from API writes.
  void db;
};

const mapRunResult = (result: {
  changes: number;
  lastInsertRowId: number;
}): { changes: number; lastInsertRowId: number } => ({
  changes: result.changes,
  lastInsertRowId: result.lastInsertRowId,
});

export const initSQLiteDatabase = (): void => {
  const db = getDatabase();
  createSchema(db);
  migrateUserSchema(db);
  migrateFoodSchema(db);
  migrateOrderAndWalletSchema(db);
  seedIfEmpty(db);
};

export const getSQLiteDB = (): DBInterface => {
  const db = getDatabase();
  return {
    execSync(sql: string): void {
      db.execSync(sql);
    },
    async getAllAsync(sql: string, params: any[] = []): Promise<any[]> {
      return db.getAllAsync(sql, params);
    },
    async getFirstAsync(sql: string, params: any[] = []): Promise<any | null> {
      return db.getFirstAsync(sql, params);
    },
    async runAsync(sql: string, params: any[] = []): Promise<any> {
      const result = await db.runAsync(sql, params);
      return mapRunResult(result);
    },
  };
};
