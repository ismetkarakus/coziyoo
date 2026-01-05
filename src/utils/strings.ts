export const strings = {
  // Common
  loading: 'Loading...',
  error: 'Something went wrong',
  retry: 'Retry',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  done: 'Done',
  next: 'Next',
  back: 'Back',
  
  // Navigation
  home: 'Home',
  explore: 'Explore',
  cart: 'Cart',
  notifications: 'Notifications',
  profile: 'Profile',
  
  // Auth
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  forgotPassword: 'Forgot Password?',
  
  // Buyer
  addToCart: 'Add to Cart',
  buyNow: 'Buy Now',
  checkout: 'Checkout',
  orderHistory: 'Order History',
  
  // Seller
  addProduct: 'Add Product',
  manageProducts: 'Manage Products',
  orders: 'Orders',
  analytics: 'Analytics',
  
  // Chat
  sendMessage: 'Send Message',
  typeMessage: 'Type a message...',
  
  // Validation
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email',
  passwordTooShort: 'Password must be at least 6 characters',
  passwordsDontMatch: 'Passwords do not match',
} as const;

export type StringKey = keyof typeof strings;





