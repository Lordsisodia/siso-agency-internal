# Code Refactoring

> **Category:** Development Workflow
> **Skill:** refactoring
> **Created:** 2026-01-18
> **Last Updated:** 2026-01-18
> **Status:** Production Ready
> **Agents:** primary, subagent
> **Priority:** High

## Overview

Systematic code refactoring skill focused on improving code quality, maintainability, and performance while preserving functionality. Covers SOLID principles, design patterns, code smells identification, and step-by-step refactoring techniques with before/after examples.

## Key Capabilities

- Code smell detection and elimination
- SOLID principles application
- Design pattern implementation
- Large-scale refactoring strategies
- Safe refactoring with tests
- Performance optimization
- Code complexity reduction
- Duplication elimination
- API design improvements
- Legacy code modernization

## Prerequisites

- Understanding of programming fundamentals
- Test coverage ( Jest, Vitest, or similar)
- Version control (Git)
- Code review workflow
- Static analysis tools (ESLint, TypeScript, etc.)

## Code Smells and Solutions

### Long Method

**Before:**
```typescript
function processOrder(order: Order): ProcessedOrder {
  // Validation
  if (!order.customerId) {
    throw new Error('Customer ID required');
  }
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.shippingAddress) {
    throw new Error('Shipping address required');
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    const price = item.quantity * item.price;
    subtotal += price;
  }

  // Apply discounts
  let discount = 0;
  if (order.couponCode) {
    const coupon = await CouponService.validate(order.couponCode);
    if (coupon) {
      discount = subtotal * (coupon.percentage / 100);
    }
  }

  // Calculate tax
  const taxRate = await TaxService.getRate(order.shippingAddress.country);
  const tax = (subtotal - discount) * taxRate;

  // Calculate shipping
  let shipping = 0;
  if (order.shippingMethod === 'express') {
    shipping = 15.99;
  } else if (order.shippingMethod === 'overnight') {
    shipping = 29.99;
  } else {
    shipping = 4.99;
  }

  // Create processed order
  const total = subtotal - discount + tax + shipping;

  const processedOrder: ProcessedOrder = {
    id: generateId(),
    customerId: order.customerId,
    items: order.items,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    status: 'pending',
    createdAt: new Date(),
  };

  // Save to database
  await OrderRepository.save(processedOrder);

  // Send confirmation email
  await EmailService.sendConfirmation(order.customerId, processedOrder.id);

  // Update inventory
  for (const item of order.items) {
    await InventoryService.decrement(item.productId, item.quantity);
  }

  return processedOrder;
}
```

**After:**
```typescript
// Main orchestrator - easy to read and understand
async function processOrder(order: Order): Promise<ProcessedOrder> {
  validateOrder(order);

  const pricing = await calculateOrderPricing(order);
  const processedOrder = buildProcessedOrder(order, pricing);

  await saveOrder(processedOrder);
  await sendOrderConfirmation(processedOrder);
  await updateInventory(order.items);

  return processedOrder;
}

// Validation - single responsibility
function validateOrder(order: Order): void {
  const validator = new OrderValidator();
  validator.validate(order);
}

class OrderValidator {
  validate(order: Order): void {
    this.validateCustomer(order);
    this.validateItems(order);
    this.validateShippingAddress(order);
  }

  private validateCustomer(order: Order): void {
    if (!order.customerId) {
      throw new ValidationError('Customer ID required');
    }
  }

  private validateItems(order: Order): void {
    if (!order.items?.length) {
      throw new ValidationError('Order must have items');
    }
  }

  private validateShippingAddress(order: Order): void {
    if (!order.shippingAddress) {
      throw new ValidationError('Shipping address required');
    }
  }
}

// Pricing calculation - separated and testable
async function calculateOrderPricing(order: Order): Promise<OrderPricing> {
  const subtotal = calculateSubtotal(order.items);
  const discount = await calculateDiscount(order.couponCode, subtotal);
  const tax = await calculateTax(subtotal, discount, order.shippingAddress.country);
  const shipping = calculateShipping(order.shippingMethod);

  return { subtotal, discount, tax, shipping };
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
}

async function calculateDiscount(
  couponCode: string | undefined,
  subtotal: number
): Promise<number> {
  if (!couponCode) return 0;

  const coupon = await CouponService.validate(couponCode);
  return coupon ? subtotal * (coupon.percentage / 100) : 0;
}

async function calculateTax(
  subtotal: number,
  discount: number,
  country: string
): Promise<number> {
  const taxRate = await TaxService.getRate(country);
  return (subtotal - discount) * taxRate;
}

function calculateShipping(method: string): number {
  const shippingRates: Record<string, number> = {
    standard: 4.99,
    express: 15.99,
    overnight: 29.99,
  };

  return shippingRates[method] || shippingRates.standard;
}

// Builder pattern for object creation
function buildProcessedOrder(
  order: Order,
  pricing: OrderPricing
): ProcessedOrder {
  const total = pricing.subtotal - pricing.discount + pricing.tax + pricing.shipping;

  return {
    id: generateId(),
    customerId: order.customerId,
    items: order.items,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    tax: pricing.tax,
    shipping: pricing.shipping,
    total,
    status: 'pending',
    createdAt: new Date(),
  };
}

// Side effects - isolated and separately testable
async function saveOrder(order: ProcessedOrder): Promise<void> {
  await OrderRepository.save(order);
}

async function sendOrderConfirmation(order: ProcessedOrder): Promise<void> {
  await EmailService.sendConfirmation(order.customerId, order.id);
}

async function updateInventory(items: OrderItem[]): Promise<void> {
  await Promise.all(
    items.map(item =>
      InventoryService.decrement(item.productId, item.quantity)
    )
  );
}
```

### Large Class

**Before:**
```typescript
class UserController {
  async register(req: Request, res: Response) {
    // 50 lines of registration logic
  }

  async login(req: Request, res: Response) {
    // 30 lines of login logic
  }

  async logout(req: Request, res: Response) {
    // 20 lines of logout logic
  }

  async updateProfile(req: Request, res: Response) {
    // 40 lines of profile update logic
  }

  async changePassword(req: Request, res: Response) {
    // 30 lines of password change logic
  }

  async deleteAccount(req: Request, res: Response) {
    // 20 lines of account deletion logic
  }

  async getOrders(req: Request, res: Response) {
    // 30 lines of order retrieval logic
  }

  async createOrder(req: Request, res: Response) {
    // 40 lines of order creation logic
  }

  async updateOrder(req: Request, res: Response) {
    // 30 lines of order update logic
  }

  async cancelOrder(req: Request, res: Response) {
    // 20 lines of order cancellation logic
  }

  // ... 20 more methods
}
```

**After:**
```typescript
// Authentication controller - focused on auth concerns
class AuthController {
  constructor(
    private authService: AuthService,
    private authValidator: AuthValidator
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const dto = this.authValidator.validateRegistration(req.body);
    const result = await this.authService.register(dto);

    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const dto = this.authValidator.validateLogin(req.body);
    const result = await this.authService.login(dto);

    res.json(result);
  }

  async logout(req: Request, res: Response): Promise<void> {
    await this.authService.logout(req.user.id);

    res.status(204).send();
  }
}

// Profile controller - handles user profile operations
class ProfileController {
  constructor(
    private profileService: ProfileService,
    private profileValidator: ProfileValidator
  ) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await this.profileService.getProfile(req.user.id);
    res.json(profile);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const dto = this.profileValidator.validateUpdate(req.body);
    const profile = await this.profileService.updateProfile(req.user.id, dto);

    res.json(profile);
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const dto = this.profileValidator.validatePasswordChange(req.body);
    await this.profileService.changePassword(req.user.id, dto);

    res.status(204).send();
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    await this.profileService.deleteAccount(req.user.id);

    res.status(204).send();
  }
}

// Order controller - handles order operations
class OrderController {
  constructor(
    private orderService: OrderService,
    private orderValidator: OrderValidator
  ) {}

  async getOrders(req: Request, res: Response): Promise<void> {
    const filter = this.orderValidator.validateFilter(req.query);
    const orders = await this.orderService.getOrders(req.user.id, filter);

    res.json(orders);
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const dto = this.orderValidator.validateCreate(req.body);
    const order = await this.orderService.createOrder(req.user.id, dto);

    res.status(201).json(order);
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.getOrder(
      req.user.id,
      req.params.orderId
    );

    res.json(order);
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    const dto = this.orderValidator.validateUpdate(req.body);
    const order = await this.orderService.updateOrder(
      req.user.id,
      req.params.orderId,
      dto
    );

    res.json(order);
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    await this.orderService.cancelOrder(req.user.id, req.params.orderId);

    res.status(204).send();
  }
}

// Router setup - clean separation of concerns
const authRouter = Router();
const profileRouter = Router();
const orderRouter = Router();

authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/logout', authenticate, authController.logout.bind(authController));

profileRouter.get('/', authenticate, profileController.getProfile.bind(profileController));
profileRouter.patch('/', authenticate, profileController.updateProfile.bind(profileController));
profileRouter.post('/password', authenticate, profileController.changePassword.bind(profileController));
profileRouter.delete('/', authenticate, profileController.deleteAccount.bind(profileController));

orderRouter.get('/', authenticate, orderController.getOrders.bind(orderController));
orderRouter.post('/', authenticate, orderController.createOrder.bind(orderController));
orderRouter.get('/:orderId', authenticate, orderController.getOrder.bind(orderController));
orderRouter.patch('/:orderId', authenticate, orderController.updateOrder.bind(orderController));
orderRouter.delete('/:orderId', authenticate, orderController.cancelOrder.bind(orderController));
```

### Duplicated Code

**Before:**
```typescript
// File: user.controller.ts
async function getUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // ... update logic
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // ... delete logic
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Same pattern repeated in post.controller.ts, order.controller.ts, etc.
```

**After:**
```typescript
// Generic error handler decorator
function asyncHandler(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// Generic not found handler
async function findByIdOrThrow<T>(
  model: Model<T>,
  id: string,
  errorMessage?: string
): Promise<T> {
  const entity = await model.findById(id);
  if (!entity) {
    throw new NotFoundError(errorMessage || 'Resource not found');
  }
  return entity;
}

// Custom error classes
class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Global error handler middleware
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  if (err instanceof NotFoundError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Clean controller using the utilities
class UserController {
  @asyncHandler
  async getUser(req: Request, res: Response): Promise<void> {
    const user = await findByIdOrThrow(User, req.params.id, 'User not found');
    res.json(user);
  }

  @asyncHandler
  async updateUser(req: Request, res: Response): Promise<void> {
    const user = await findByIdOrThrow(User, req.params.id, 'User not found');
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  }

  @asyncHandler
  async deleteUser(req: Request, res: Response): Promise<void> {
    await findByIdOrThrow(User, req.params.id, 'User not found');
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }
}
```

## SOLID Principles

### Single Responsibility Principle (SRP)

**Before:**
```typescript
class User {
  constructor(
    public name: string,
    public email: string,
    public password: string
  ) {}

  save() {
    // Database save logic
  }

  sendWelcomeEmail() {
    // Email sending logic
  }

  validatePassword(password: string) {
    // Password validation logic
  }

  hashPassword() {
    // Password hashing logic
  }

  generateJWT() {
    // JWT generation logic
  }
}
```

**After:**
```typescript
// User entity - only holds data
class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public passwordHash: string
  ) {}
}

// Repository - handles persistence
class UserRepository {
  async save(user: User): Promise<User> {
    // Database save logic
  }

  async findById(id: string): Promise<User | null> {
    // Database find logic
  }
}

// Email service - handles email
class EmailService {
  async sendWelcomeEmail(user: User): Promise<void> {
    // Email sending logic
  }
}

// Auth service - handles authentication
class AuthService {
  async hashPassword(password: string): Promise<string> {
    // Password hashing logic
  }

  async validatePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // Password validation logic
  }

  async generateToken(user: User): Promise<string> {
    // JWT generation logic
  }
}
```

### Open/Closed Principle (OCP)

**Before:**
```typescript
function calculateDiscount(order: Order): number {
  if (order.type === 'regular') {
    return order.total * 0.05;
  } else if (order.type === 'vip') {
    return order.total * 0.10;
  } else if (order.type === 'premium') {
    return order.total * 0.15;
  }
  // Adding new customer types requires modifying this function
  return 0;
}
```

**After:**
```typescript
// Strategy interface
interface DiscountStrategy {
  calculate(order: Order): number;
}

// Concrete strategies
class RegularDiscountStrategy implements DiscountStrategy {
  calculate(order: Order): number {
    return order.total * 0.05;
  }
}

class VIPDiscountStrategy implements DiscountStrategy {
  calculate(order: Order): number {
    return order.total * 0.10;
  }
}

class PremiumDiscountStrategy implements DiscountStrategy {
  calculate(order: Order): number {
    return order.total * 0.15;
  }
}

// Strategy registry
class DiscountStrategyRegistry {
  private strategies: Map<string, DiscountStrategy> = new Map();

  register(type: string, strategy: DiscountStrategy): void {
    this.strategies.set(type, strategy);
  }

  getStrategy(type: string): DiscountStrategy {
    return this.strategies.get(type) || new RegularDiscountStrategy();
  }
}

// Usage
const registry = new DiscountStrategyRegistry();
registry.register('regular', new RegularDiscountStrategy());
registry.register('vip', new VIPDiscountStrategy());
registry.register('premium', new PremiumDiscountStrategy());

// Adding new types doesn't require modifying existing code
registry.register('platinum', new PlatinumDiscountStrategy());

function calculateDiscount(order: Order, registry: DiscountStrategyRegistry): number {
  const strategy = registry.getStrategy(order.type);
  return strategy.calculate(order);
}
```

### Dependency Inversion Principle (DIP)

**Before:**
```typescript
class OrderProcessor {
  private mysqlConnection: MySQLConnection;

  constructor() {
    this.mysqlConnection = new MySQLConnection();
  }

  async process(order: Order): Promise<void> {
    await this.mysqlConnection.query('INSERT INTO orders ...');
  }
}
```

**After:**
```typescript
// Abstraction
interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
}

class OrderProcessor {
  constructor(private db: DatabaseConnection) {}

  async process(order: Order): Promise<void> {
    await this.db.query('INSERT INTO orders ...', [order]);
  }
}

// Different implementations
class MySQLConnection implements DatabaseConnection {
  async query(sql: string, params?: any[]): Promise<any> {
    // MySQL implementation
  }
}

class PostgreSQLConnection implements DatabaseConnection {
  async query(sql: string, params?: any[]): Promise<any> {
    // PostgreSQL implementation
  }
}

// Dependency injection
const mysqlProcessor = new OrderProcessor(new MySQLConnection());
const postgresProcessor = new OrderProcessor(new PostgreSQLConnection());
```

## Refactoring Techniques

### Extract Method

**Before:**
```typescript
function printOwing(invoice: Invoice): void {
  let outstanding = 0;

  console.log('*************************');
  console.log('***** Customer Owes *****');
  console.log('*************************');

  // Calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // Print details
  const today = new Date();
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${today.toLocaleDateString()}`);
}
```

**After:**
```typescript
function printOwing(invoice: Invoice): void {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

function printBanner(): void {
  console.log('*************************');
  console.log('***** Customer Owes *****');
  console.log('*************************');
}

function calculateOutstanding(invoice: Invoice): number {
  return invoice.orders.reduce((sum, order) => sum + order.amount, 0);
}

function printDetails(invoice: Invoice, outstanding: number): void {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${new Date().toLocaleDateString()}`);
}
```

### Replace Conditional with Polymorphism

**Before:**
```typescript
function calculateSpeed(vehicle: Vehicle): number {
  switch (vehicle.type) {
    case 'car':
      return vehicle.horsepower * 1.5;
    case 'truck':
      return vehicle.horsepower * 0.8;
    case 'motorcycle':
      return vehicle.horsepower * 2.0;
    default:
      throw new Error('Unknown vehicle type');
  }
}
```

**After:**
```typescript
abstract class Vehicle {
  abstract calculateSpeed(): number;
}

class Car extends Vehicle {
  constructor(public horsepower: number) {
    super();
  }

  calculateSpeed(): number {
    return this.horsepower * 1.5;
  }
}

class Truck extends Vehicle {
  constructor(public horsepower: number) {
    super();
  }

  calculateSpeed(): number {
    return this.horsepower * 0.8;
  }
}

class Motorcycle extends Vehicle {
  constructor(public horsepower: number) {
    super();
  }

  calculateSpeed(): number {
    return this.horsepower * 2.0;
  }
}
```

## Refactoring Checklist

### Before Refactoring
- [ ] Ensure test coverage is adequate (80%+)
- [ ] Create a backup branch
- [ ] Identify the specific smell or issue
- [ ] Define the refactoring goal
- [ ] Estimate time and complexity

### During Refactoring
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Keep functionality identical
- [ ] Commit often with clear messages
- [ ] Document complex changes

### After Refactoring
- [ ] All tests pass
- [ ] Code review completed
- [ ] Performance verified
- [ ] Documentation updated
- [ ] Integration tested
- [ ] Monitor in production

## Safe Refactoring Workflow

1. **Characterize the Change**
   - Identify the code smell
   - Determine the refactoring technique
   - Estimate the scope

2. **Find Test Points**
   - Ensure existing tests cover the code
   - Add tests if coverage is insufficient
   - Document expected behavior

3. **Apply Refactoring**
   - Make the smallest possible change
   - Run tests immediately
   - Repeat until complete

4. **Verify**
   - All tests pass
   - No behavioral changes
   - Code is cleaner

5. **Commit**
   - Clear commit message
   - Reference the issue/ticket
   - Include before/after in description

## Tools and Automation

### ESLint Rules
```json
{
  "rules": {
    "max-lines-per-function": ["warn", 50],
    "max-depth": ["error", 4],
    "max-params": ["warn", 3],
    "complexity": ["warn", 10],
    "max-lines": ["warn", 300]
  }
}
```

### SonarQube Configuration
```xml
<sonar>
  <sonar.codeCoveragePlugin>jacoco</sonar.codeCoveragePlugin>
  <sonar.coverage.jacoco.xmlReportPaths>
    target/site/jacoco/jacoco.xml
  </sonar.coverance.jacoco.xmlReportPaths>
  <sonar.issuesReport.html.enable>true</sonar.issuesReport.html.enable>
  <sonar.cpd.minimumTokens>100</sonar.cpd.minimumTokens>
</sonar>
```

## Best Practices

1. **Refactor in Small Steps**: Don't try to do everything at once
2. **Tests First**: Ensure you have a safety net
3. **Keep It Simple**: Don't over-engineer solutions
4. **Preserve Behavior**: Refactoring should not change functionality
5. **Document Decisions**: Explain why you made certain changes
6. **Review as You Go**: Don't wait for a large review at the end
7. **Measure Quality**: Use metrics to track improvements
8. **Learn Patterns**: Study design patterns and anti-patterns

## Common Pitfalls

- Refactoring without tests
- Changing functionality while refactoring
- Making too many changes at once
- Not committing frequently
- Ignoring performance implications
- Over-abstraction
- Premature optimization
- Not considering edge cases
