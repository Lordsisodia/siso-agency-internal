# 🛒 XP Store UI Design Mockups

## 🎨 Core UI Components

### 1. XP Balance Widget (Always Visible)
```typescript
interface XPBalanceWidget {
  currentXP: number
  pendingLoans: number
  reserveXP: number
  canSpend: number
  totalEarned: number
  weeklySpending: number
}

// Visual Design
const XPBalanceDisplay = () => (
  <div className="xp-balance-widget bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold">💰 {currentXP} XP</h3>
        <p className="text-sm opacity-80">Available to spend: {canSpend}</p>
      </div>
      <div className="text-right">
        {pendingLoans > 0 && (
          <p className="text-yellow-300 text-sm">⚠️ Loan: -{pendingLoans}</p>
        )}
        <p className="text-xs opacity-60">Reserve: {reserveXP}</p>
      </div>
    </div>
    
    {/* Quick spending indicators */}
    <div className="flex gap-2 mt-2">
      <span className="badge">🔥 Can afford: Chill Session</span>
      <span className="badge">💔 Need 150 more: Gaming Pass</span>
    </div>
  </div>
)
```

### 2. Reward Store Categories
```typescript
const CategoryGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
    <CategoryCard 
      emoji="💨"
      title="Cannabis"
      subtitle="Earned relaxation"
      totalItems={6}
      cheapestPrice={150}
    />
    <CategoryCard 
      emoji="🏖️"
      title="Time Off"
      subtitle="Guilt-free breaks"
      totalItems={8}
      cheapestPrice={100}
    />
    <CategoryCard 
      emoji="🍕"
      title="Food & Treats"
      subtitle="Earned indulgence"
      totalItems={12}
      cheapestPrice={100}
    />
    <CategoryCard 
      emoji="🎮"
      title="Entertainment"
      subtitle="Fun activities"
      totalItems={10}
      cheapestPrice={200}
    />
    <CategoryCard 
      emoji="💎"
      title="Luxury"
      subtitle="Big purchases"
      totalItems={5}
      cheapestPrice={800}
    />
    <CategoryCard 
      emoji="📅"
      title="Subscriptions"
      subtitle="Ongoing rewards"
      totalItems={4}
      cheapestPrice={1500}
    />
  </div>
)
```

### 3. Individual Reward Cards
```typescript
interface RewardCardProps {
  reward: {
    name: string
    description: string
    emoji: string
    currentPrice: number
    originalPrice: number
    discountPercent?: number
    requiresStreak?: number
    maxDailyUse?: number
    usedToday?: number
  }
  userXP: number
  onPurchase: () => void
}

const RewardCard = ({ reward, userXP, onPurchase }: RewardCardProps) => {
  const canAfford = userXP >= reward.currentPrice
  const isDiscounted = reward.discountPercent && reward.discountPercent > 0
  const isLimitReached = reward.maxDailyUse && reward.usedToday >= reward.maxDailyUse
  
  return (
    <div className={`reward-card p-4 border rounded-lg transition-all ${
      canAfford ? 'border-green-500 hover:shadow-lg cursor-pointer' : 'border-gray-300 opacity-60'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <span className="text-2xl">{reward.emoji}</span>
            {reward.name}
          </h3>
          <p className="text-sm text-gray-600">{reward.description}</p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2">
            {isDiscounted && (
              <span className="line-through text-gray-400">{reward.originalPrice}</span>
            )}
            <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {reward.currentPrice} XP
            </span>
          </div>
          
          {isDiscounted && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{reward.discountPercent}%
            </span>
          )}
        </div>
      </div>
      
      {/* Usage indicators */}
      <div className="mt-2 flex justify-between items-center">
        <div className="flex gap-2 text-xs">
          {reward.requiresStreak && (
            <span className="badge bg-purple-100">🔥 {reward.requiresStreak} streak required</span>
          )}
          {reward.maxDailyUse && (
            <span className="badge bg-blue-100">
              📊 {reward.usedToday || 0}/{reward.maxDailyUse} today
            </span>
          )}
        </div>
        
        <button 
          onClick={onPurchase}
          disabled={!canAfford || isLimitReached}
          className={`px-4 py-2 rounded text-sm font-medium ${
            canAfford && !isLimitReached
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!canAfford ? 'Need More XP' : isLimitReached ? 'Daily Limit' : 'Purchase'}
        </button>
      </div>
    </div>
  )
}
```

### 4. Purchase Confirmation Dialog
```typescript
const PurchaseConfirmationModal = ({ reward, userBalance, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-content bg-white p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Confirm Purchase</h2>
      
      <div className="reward-preview flex items-center gap-4 p-4 bg-gray-50 rounded mb-4">
        <span className="text-3xl">{reward.emoji}</span>
        <div>
          <h3 className="font-bold">{reward.name}</h3>
          <p className="text-sm text-gray-600">{reward.description}</p>
        </div>
      </div>
      
      {/* Cost breakdown */}
      <div className="cost-breakdown space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Cost:</span>
          <span className="font-bold text-red-600">-{reward.currentPrice} XP</span>
        </div>
        <div className="flex justify-between">
          <span>Current Balance:</span>
          <span>{userBalance.currentXP} XP</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>Remaining After:</span>
          <span className={`font-bold ${
            userBalance.currentXP - reward.currentPrice >= userBalance.reserveXP 
              ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {userBalance.currentXP - reward.currentPrice} XP
          </span>
        </div>
        
        {userBalance.currentXP - reward.currentPrice < userBalance.reserveXP && (
          <div className="bg-yellow-100 p-2 rounded text-sm">
            ⚠️ This will dip into your reserve fund!
          </div>
        )}
      </div>
      
      {/* Motivation messaging */}
      <div className="motivation-message bg-green-50 p-3 rounded mb-4">
        <p className="text-sm text-green-800">
          ✨ <strong>You earned this!</strong> This reward represents {Math.round(reward.currentPrice / 50)} hours of productive work.
        </p>
      </div>
      
      {/* Time to re-earn */}
      <div className="text-xs text-gray-500 mb-4">
        💡 You can re-earn this amount in approximately {Math.ceil(reward.currentPrice / 150)} days of normal productivity.
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Maybe Later
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Purchase Now
        </button>
      </div>
      
      {/* Loan option if can't afford */}
      {userBalance.canSpend < reward.currentPrice && userBalance.canSpend + 1000 >= reward.currentPrice && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
          <h4 className="font-bold text-orange-800 mb-2">💳 XP Loan Available</h4>
          <p className="text-sm text-orange-700">
            Borrow {reward.currentPrice - userBalance.canSpend} XP at 20% interest. 
            You'll owe {Math.round((reward.currentPrice - userBalance.canSpend) * 1.2)} XP.
          </p>
          <button className="mt-2 text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
            Use Loan
          </button>
        </div>
      )}
    </div>
  </div>
)
```

### 5. Purchase History & Analytics
```typescript
const PurchaseHistory = ({ purchases, analytics }) => (
  <div className="space-y-4">
    {/* Quick stats */}
    <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        label="Total Spent"
        value={`${analytics.totalSpent} XP`}
        subtitle="Last 30 days"
      />
      <StatCard 
        label="Daily Average"
        value={`${analytics.averageDaily} XP`}
        subtitle="Spending rate"
      />
      <StatCard 
        label="Most Expensive"
        value={`${analytics.mostExpensive} XP`}
        subtitle="Single purchase"
      />
      <StatCard 
        label="Satisfaction"
        value={analytics.averageSatisfaction ? `${analytics.averageSatisfaction}/10` : 'N/A'}
        subtitle="Average rating"
      />
    </div>
    
    {/* Category breakdown */}
    <div className="category-breakdown">
      <h3 className="font-bold mb-2">Spending by Category</h3>
      <div className="space-y-2">
        {Object.entries(analytics.categoryBreakdown).map(([category, amount]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="capitalize">{category.toLowerCase().replace('_', ' ')}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(amount / analytics.totalSpent) * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono">{amount} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Recent purchases */}
    <div className="recent-purchases">
      <h3 className="font-bold mb-2">Recent Purchases</h3>
      <div className="space-y-2">
        {purchases.slice(0, 10).map(purchase => (
          <div key={purchase.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{purchase.rewardName}</span>
              <div className="text-xs text-gray-500">
                {new Date(purchase.purchasedAt).toLocaleDateString()}
                {purchase.isLoan && <span className="text-orange-600 ml-2">📋 Loan</span>}
                {purchase.consumed && <span className="text-green-600 ml-2">✅ Used</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-red-600 font-mono">-{purchase.actualPrice} XP</div>
              {purchase.satisfaction && (
                <div className="text-xs text-yellow-600">
                  {'⭐'.repeat(Math.round(purchase.satisfaction / 2))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
```

### 6. Active Loans Dashboard
```typescript
const LoansPanel = ({ loans, onRepayment }) => (
  <div className="loans-panel bg-orange-50 border border-orange-200 rounded-lg p-4">
    <h3 className="font-bold text-orange-800 mb-4">📋 Active Loans</h3>
    
    {loans.length === 0 ? (
      <p className="text-gray-600">No active loans</p>
    ) : (
      <div className="space-y-3">
        {loans.map(loan => {
          const daysUntilDue = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          const isOverdue = daysUntilDue < 0
          const remaining = loan.totalOwed - loan.paidAmount
          
          return (
            <div key={loan.id} className={`loan-card p-3 rounded border ${
              isOverdue ? 'border-red-400 bg-red-50' : 'border-orange-300 bg-white'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">
                    Loan: {loan.amount} XP + {Math.round(loan.amount * loan.interestRate)} interest
                  </div>
                  <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    Due: {new Date(loan.dueDate).toLocaleDateString()}
                    {isOverdue ? ` (${Math.abs(daysUntilDue)} days overdue!)` : ` (${daysUntilDue} days)`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{remaining} XP owed</div>
                  <div className="text-xs text-gray-500">
                    Paid: {loan.paidAmount}/{loan.totalOwed}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onRepayment(loan.id, Math.min(remaining, 500))}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Pay 500 XP
                </button>
                <button 
                  onClick={() => onRepayment(loan.id, remaining)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Pay Full ({remaining} XP)
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)
```

### 7. Temptation & Motivation Elements
```typescript
const TemptationBar = ({ featuredRewards, userXP }) => (
  <div className="temptation-bar bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg mb-4">
    <h3 className="font-bold mb-2">🔥 Hot Deals - Limited Time!</h3>
    <div className="flex gap-4 overflow-x-auto">
      {featuredRewards.map(reward => (
        <div key={reward.id} className="flex-shrink-0 bg-white/20 p-3 rounded">
          <div className="text-lg">{reward.emoji}</div>
          <div className="font-medium">{reward.name}</div>
          <div className="text-sm opacity-80">
            {reward.discountPercent}% OFF - {reward.currentPrice} XP
          </div>
          {userXP >= reward.currentPrice && (
            <button className="mt-1 bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold">
              BUY NOW
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)

const MotivationalMessages = ({ userStats, nearAffordable }) => (
  <div className="motivational-section space-y-2 text-sm">
    <div className="bg-blue-50 p-2 rounded">
      💪 <strong>You're doing great!</strong> You've earned {userStats.weeklyXP} XP this week.
    </div>
    
    {nearAffordable.length > 0 && (
      <div className="bg-yellow-50 p-2 rounded">
        🎯 <strong>So close!</strong> Just {nearAffordable[0].xpNeeded} more XP to afford {nearAffordable[0].name}
      </div>
    )}
    
    {userStats.streak > 7 && (
      <div className="bg-green-50 p-2 rounded">
        🔥 <strong>Streak Master!</strong> Your {userStats.streak}-day streak deserves a reward!
      </div>
    )}
  </div>
)
```

## 🎮 Complete XP Store Layout
```typescript
const XPStorePage = () => (
  <div className="xp-store-page max-w-6xl mx-auto p-4 space-y-6">
    {/* Header with balance */}
    <XPBalanceWidget />
    
    {/* Temptation elements */}
    <TemptationBar />
    <MotivationalMessages />
    
    {/* Active loans warning */}
    {hasActiveLoans && <LoansPanel />}
    
    {/* Main store categories */}
    <CategoryGrid />
    
    {/* Recent purchases & analytics */}
    <div className="grid md:grid-cols-2 gap-6">
      <PurchaseHistory />
      <SpendingAnalytics />
    </div>
  </div>
)
```

This UI design transforms XP spending into an **addictive shopping experience** that makes you feel great about spending your hard-earned productivity points on personal indulgences! 🛒✨