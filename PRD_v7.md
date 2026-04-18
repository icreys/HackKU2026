# Life After Grad — Product Requirements Document
**Version:** 7.0
**Last Updated:** April 18, 2026
**Status:** Draft

---

## 1. Product Overview

Life After Grad is a browser-based financial life simulator for recent college graduates. Players select one of three randomly generated graduate profiles, then navigate a series of annual decisions — choosing each year how to divide their limited time between working and investing across six asset classes. Random life events intervene every year regardless of what the player does. The simulation runs for 5–15 years and ends with a scored outcome reflecting the player's financial and personal state.

The experience is structured as a sequence of real-life scenarios presented one at a time. Each scenario requires the player to make a choice. Every choice has an immediate, visible financial consequence. The player never manages a portfolio dashboard — they make discrete, time-limited decisions and live with the results.

**Visual direction:** The product uses a dark color theme throughout. All screens, cards, and UI elements must be designed for dark backgrounds.

**Reference experience:** [Spent (playspent.org)](https://playspent.org/) — a poverty simulator that puts the player through one financial scenario at a time, shows the consequence of each choice in plain language, and makes abstract hardship feel personal and real.

---

## 2. Problem Statement

College students graduate with an average of ~$30,000 in student debt and near-zero financial literacy. Existing financial tools fail to engage this audience because they are abstract and impersonal. The problem is not a lack of information — it is a lack of emotional stakes.

If a person can experience a decade of financial consequences in ten minutes — feeling the weight of a missed 401k match, the panic of an emergency without savings, the slow power of compound interest — the lesson is more durable than any lecture.

---

## 3. Target Users

| Attribute | Detail |
|-----------|--------|
| Primary | College juniors, seniors, and recent graduates (ages 20–26) |
| Context | Personal use, campus financial wellness programs, social sharing |
| Mindset | Curious but overwhelmed by money; engaged by narrative and games; resistant to lectures |
| Device | Primarily mobile browser; desktop supported |

---

## 4. Success Metrics

| Metric | Target |
|--------|--------|
| Completion rate | A first-time player finishes one full simulation |
| Emotional response | At least one moment causes the player to pause and reflect |
| Financial learning | Player encounters and reads at least one investment fact card |
| Replayability | Player initiates a second playthrough after seeing their ending |
| Win rate | ~60% of playthroughs result in a positive ending |
| Shareability | Ending screen produces a card the player wants to share |

---

## 5. Core Requirements

### 5.1 Game Structure

The game is divided into **years**, each of which contains the following in order:

1. **Six actions** — the player allocates their six available actions for the year (see 5.3)
2. **2–4 random events** — life events that occur regardless of player actions (see 5.5)
3. **Year summary** — a plain-language recap of net worth movement and what happened

The player chooses a game length at setup: **Short** (5 years), **Standard** (10 years), or **Marathon** (15 years).

### 5.2 Character Selection

At the start of each game, the product must present the player with **three randomly generated graduate profiles** to choose from. The player selects one and plays as that character for the entire game.

Each profile must define:

- A name and a one-sentence background
- A starting income level (annual salary)
- A starting savings amount
- A starting debt amount (student loans)

The three profiles must differ meaningfully from each other and must satisfy the following constraint:

> **Higher income and higher savings come with higher debt. Lower income and lower savings come with lower debt. These three attributes are zero-sum weighted — a profile cannot be advantaged on all axes simultaneously.**

The profiles are randomly generated within defined ranges each time the game starts. The ranges must be wide enough that the choice feels consequential, and narrow enough that all three profiles are viable paths to a positive ending.

| Attribute | Lower bound | Upper bound |
|-----------|-------------|-------------|
| Annual income | $38,000 | $85,000 |
| Starting savings | $500 | $12,000 |
| Starting debt | $0 | $110,000 |

The product must communicate the tradeoff to the player before they choose — not as numbers alone, but as a plain-language description of what each profile's life looks like.

### 5.3 Annual Actions

Each year, the player has **six actions** to allocate. Actions represent how the player chooses to spend their time and energy over the course of the year.

#### Default Action Pair

By default, each of the six action slots is pre-set as **one work action paired with one invest action** — that is, the player by default performs three work actions and three invest actions per year. The player may override this default for any slot to instead perform **two work actions** or **two invest actions** in that slot. All six slots must be configured before the year begins.

#### Work Actions

A work action represents the player dedicating time to their career. Each work action produces income **immediately** — the earned amount is added to the player's cash balance the moment the action is confirmed, not at the end of the year.

The amount earned per work action is based on the player's current salary divided by the number of standard work actions in a year. Additional work actions beyond the default earn income at the same per-action rate.

#### Invest Actions

An invest action allows the player to buy or sell one asset class. The player selects the asset and uses a slider to choose the dollar amount to move in or out. The slider must show the player their current balance in that asset and their available cash.

**Sell cooldown:** Any asset that was purchased in a previous action must observe a **one-action cooldown** before it can be sold. If an asset was purchased in action slot N, it cannot be sold until action slot N+2 or later (within the same year or in a future year). The product must clearly indicate which assets are currently available to sell and which are in cooldown.

#### Career Development Actions

In addition to standard work and invest actions, the player may spend an action slot on a **career development option**. These represent major life choices that change the player's earning trajectory. Available options:

**Job change (switching companies)**
The player forgoes the income from that action slot and initiates a job change. A job change results in a salary adjustment — either higher or lower — resolved as a narrative event. The new salary takes effect immediately for all subsequent work actions. The outcome range must be influenced by the player's current reputation level.

**Postgraduate study (graduate school)**
The player may enroll in a postgraduate program by spending action slots on study rather than work. Study actions produce no income and may carry a tuition cost. Upon completion of the required number of study actions (spread across multiple years), the player's salary ceiling increases significantly and their reputation improves. The player must commit to the full program at enrollment — dropping out mid-program forfeits tuition paid without conferring the salary benefit.

Career development options must be presented as narrative life events with clear plain-language descriptions of their costs and potential benefits before the player commits.

### 5.4 Investment System

The following asset classes must be available for invest actions. They unlock progressively as the game advances. When an asset class becomes available for the first time, the product must display a **knowledge fact card** before the player can interact with it (see 5.6 and 7.2).

| Asset Class | Unlocks | Required simulation behavior |
|-------------|---------|------------------------------|
| Savings Account | Year 1 | Guaranteed positive return; no loss risk; return rate reflects interest rate environment |
| Bonds | Year 1 | Low volatility; inverse relationship with interest rates; stable predictable return |
| Stocks / Index Funds | Year 2 | Higher long-run average return (~10–11% annually); meaningful short-term volatility; recovers from crashes over time |
| Options | Year 3 | High leverage; positions can expire worthless (total loss); occasional very large gains |
| Cryptocurrency | Year 3 | Extreme volatility in both directions; no underlying yield; large gains and large losses both historically plausible |
| Gold | Year 4 | Low correlation with stocks; modest long-term returns; rises during inflation and market crisis events |
| Retirement (401k/IRA) | Year 4 | Tax-advantaged; employer match modeled as a bonus return on contributions up to a cap; early withdrawal incurs a penalty |

**Sell cooldown rule:** After purchasing any asset, the player must wait one full action before they may sell it. The product must visibly indicate the cooldown state of each held asset.

**Slider mechanic:** When the player selects a buy or sell action, they must see their current balance in that asset, their available cash, and a slider controlling the amount to move.

### 5.5 Physical Asset Purchases

In addition to financial assets, the player may purchase **real property and vehicles** as invest actions. These are tangible assets that affect the player's financial state and social reputation.

**Real estate (property)**
The player may purchase residential property. A property purchase requires a significant down payment and introduces ongoing costs (mortgage payments, property tax, maintenance). Property value changes over time in line with market conditions. Owning property provides a substantial boost to the player's social reputation.

**Vehicles**
The player may purchase a vehicle. A vehicle purchase has an upfront cost and introduces ongoing costs (insurance, maintenance, depreciation). Vehicle value declines over time. Owning a vehicle above a certain value tier provides a meaningful boost to social reputation.

Physical asset purchases must:
- Be available as invest actions, subject to the same one-action sell cooldown rule
- Communicate ongoing costs clearly before the player commits
- Produce a visible and immediate reputation gain upon purchase
- Be sellable, with the sale price reflecting depreciation (vehicles) or market appreciation/depreciation (property)

### 5.6 Knowledge Fact Cards

When an asset class (financial or physical) becomes available for the first time, the product must display a **knowledge fact card** before the player interacts with it. The card must:

- Appear automatically upon first unlock — not require the player to seek it out
- Be dismissible, but require at least one deliberate tap to dismiss (not accidentally skippable)
- Explain what the asset is in plain language
- Describe how gains and losses are generated
- Provide historical context grounded in the asset's real performance over the past 50 years, including both best-case and worst-case periods
- State the asset's risk level relative to the other available assets

See Section 7.2 for the required content of each fact card.

### 5.7 Random Events

Between the player's annual actions and the year summary, **2 to 4 random events must occur every year** without exception. The player cannot avoid events by making different action choices — events happen to everyone.

Events must be presented as narrative story beats in plain language. They must never appear as system alerts or raw data updates.

Events must cover both negative and positive outcomes:

| Category | Examples |
|----------|---------|
| Normal negative | Car breakdown, medical bill, rent spike, burnout, surprise expense |
| Normal positive | Unexpected bonus, side hustle success, raise, networking opportunity |
| Black swan | Layoff, serious illness, market crash affecting all investments, recession |
| Windfall | Inheritance, equity payout, gift |

Black swan events must be visually and narratively distinct from normal events. The player must feel them.

The number of events per year (between 2 and 4) must vary — the player must not be able to predict how many events will occur in a given year.

Event probabilities must be influenced by the player's current status (health and reputation) and their character profile.

**Emergency fund rule:** If the player has less than 3 months of expenses in liquid assets (cash + savings account) when a negative financial event occurs, the shortfall must be charged as credit card debt at a high interest rate. If an adequate emergency fund exists, the event is absorbed without new debt.

### 5.8 Financial Simulation Requirements

The simulation must model the following accurately enough to be directionally correct and emotionally credible:

**Income**
- Earned income from each work action is added to the player's cash balance immediately upon action confirmation
- Base income is set by the character profile and grows over time through raises and career events
- Income can decrease due to layoffs, career changes, or postgraduate study

**Expenses**
- Fixed monthly expenses apply throughout the game
- Expenses include: housing, food, transport, lifestyle, health insurance, and loan payments
- Property and vehicle ownership add to the monthly expense baseline
- Lifestyle choices made in events can permanently raise the expense baseline (lifestyle inflation trap)

**Taxes**
- Federal income tax is applied using progressive brackets
- State tax, payroll tax, and capital gains tax are applied where relevant
- Taxes must be communicated in plain language

**Debt**
- Student loans accrue interest quarterly at 5.5% APR
- Mortgage debt accrues at a rate reflective of a realistic home loan (approximately 6–7% APR, simplified)
- Credit card debt accrues at 22% APR — incurred only through emergencies without an emergency fund
- The player can direct invest actions toward debt repayment

**Net worth**
- Net worth = cash + all financial asset balances + physical asset values − all debt balances
- Must be visible to the player at all times and updated immediately after each action and each event

### 5.9 Status System

Two non-financial dimensions must be tracked throughout the game: **Health** and **Reputation**.

**Health**
- Tracked as a hidden numerical value (0–100)
- Displayed to the player only as a qualitative label: Good, Medium, or Poor
- Responds to events (illness, burnout, lifestyle) and career decisions
- Influences the probability of future negative health events

**Reputation**
- Tracked as a hidden numerical value (0–100)
- Displayed to the player only as a qualitative label: Good, Medium, or Poor
- Influenced by career choices, job-hopping frequency, postgraduate study, property ownership, vehicle ownership, and social events
- Affects the salary outcome of job changes, the probability of positive career events, and access to certain opportunities
- Physical asset purchases (property, vehicle) must provide a significant, immediate, and visible boost to reputation

**Happiness**
- Tracked internally and used in the final ending calculation
- **Not displayed to the player at any point** — not as a number, not as a label, not as a bar
- Influenced by income-to-expense balance, health, major life events, and lifestyle choices
- Its effect on the ending must be discoverable through play, not through a visible meter

### 5.10 Ending System

At the end of the game, the product must calculate an ending based on the player's final net worth, happiness (hidden), health, and reputation together. Each ending must have a title, a 2–3 sentence narrative, and a shareable card.

Required endings:

| Ending | Criteria |
|--------|---------|
| Happy Daily Life | Balanced across all axes; net worth positive; health and reputation both Good |
| The Wolf of Wall Street | Extremely high net worth; Reputation Poor |
| Extravagant Spending | High lifestyle satisfaction (hidden happiness high); high debt; low savings |
| The Hermit | High net worth; hidden happiness low; Reputation Poor |
| The Phoenix | Started with heavy debt; ends debt-free with positive net worth |
| The Gambler | Consistently chose high-variance assets; outcome varies widely |
| The Ostrich | Net worth negative; no emergency fund; lifestyle inflation |
| The Architect | Debt-free; consistent saving and investing; health and reputation both Good |
| The Survivor | Hit by multiple black swan events; still positive net worth |
| The Steady Hand | Moderate everything; stable trajectory; no major risks taken |
| The Dreamer | Low income; sacrificed earnings for lifestyle satisfaction; hidden happiness high |

### 5.11 Replayability

- The player must be able to restart immediately after seeing their ending
- The three character profiles are re-randomized each new game
- Choosing a different profile, a different work/invest balance, different career development choices, or different assets must produce meaningfully different outcomes

---

## 6. Financial Model Parameters

### 6.1 Asset Return Behavior (50-Year Historical Basis)

| Asset | Target Avg Annual Return | Volatility | Key historical behavior to reflect |
|-------|--------------------------|------------|-----------------------------------|
| Savings Account | ~1–5% APY (varies with rate environment) | None | Near-zero in low-rate periods (2010s); 4–5%+ in high-rate periods (1980s, 2024) |
| Bonds | ~6–7% nominal avg | Low | Price falls when interest rates rise; worst single year: −13% (2022) |
| Stocks / Index Funds | ~10–11% nominal avg | Medium | Major crashes: −49% (2000–02), −57% (2008–09), −34% (2020); full recovery each time |
| Options | High positive avg; high failure rate | Very High | Most retail positions expire worthless; occasional 10× gains |
| Cryptocurrency | Very high nominal avg (2013–2025) | Extreme | −84% crash (2018), −77% crash (2022); also +1,000%+ years |
| Gold | ~7–8% nominal avg | Low-Medium | 20-year bear market 1980–2001; strong performance during inflation and crisis |
| Retirement | Mirrors underlying assets + tax/match benefit | Low-Medium | Employer match modeled as an immediate bonus return on eligible contributions |
| Property | ~4–6% annual appreciation avg | Low-Medium | Subject to local market events; illiquid; ongoing carrying costs |
| Vehicle | Depreciates ~15–20% per year | None | No investment upside; value declines to near zero over time |

During market crash events, stocks must apply a large negative shock. Gold must respond with a positive shock. Cryptocurrency must apply its most severe negative shock. Property values must decline modestly during recession events.

### 6.2 Career Development Parameters

| Option | Cost | Benefit |
|--------|------|---------|
| Job change | One action slot (no income from that slot); possible salary decrease if reputation is low | Salary adjustment; range influenced by current reputation |
| Postgraduate study | Multiple action slots across 1–2 years; tuition cost per study action | Significant salary ceiling increase upon completion; Reputation boost |

### 6.3 Expense Tiers (Monthly)

| Category | Low | Medium | High |
|----------|-----|--------|------|
| Housing (renting) | $600 | $1,200 | $2,000 |
| Food | $300 | $500 | $800 |
| Transport | $100 | $400 | $700 |
| Lifestyle | $100 | $400 | $800 |
| Health Insurance | $150 | $300 | $500 |
| Student Loan Payment | Min = balance × 1%/mo | — | Aggressive = balance × 3%/mo |
| Mortgage Payment | Derived from property price, down payment, and interest rate | — | — |
| Vehicle Running Costs | $200–$600/mo depending on vehicle tier | — | — |

### 6.4 Tax Rates

| Tax | Rate |
|-----|------|
| Federal Income | Progressive: 10% ($0–$11K), 12% ($11K–$44K), 22% ($44K–$95K), 24% ($95K–$201K), 32% ($201K+) |
| State | 5% flat (simplified) |
| Payroll (FICA) | 7.65% of gross income |
| Capital Gains | 15% on realized investment gains |
| Property | 1.2% of home value annually |

### 6.5 Debt Parameters

| Debt Type | Rate | Trigger |
|-----------|------|---------|
| Student loan | 5.5% APR, compounded quarterly | Exists from game start based on character profile |
| Mortgage | ~6.5% APR, simplified fixed rate | Incurred upon property purchase |
| Credit card | 22% APR, compounded quarterly | Incurred when a negative event hits without an adequate emergency fund |

### 6.6 Win Rate

The simulation must be tuned so that approximately 60% of playthroughs — where the player makes reasonable but not perfect decisions — result in a positive ending.

---

## 7. Content Requirements

### 7.1 Narrative Writing Standards

All scenario and event text must:

- Be written in second person ("you")
- Use plain, emotional language — never financial jargon
- Communicate financial stakes through situational and human context, not raw numbers
- Make the player feel the weight of each event before they see the financial result

### 7.2 Knowledge Fact Card Content Requirements

Each fact card is displayed automatically the first time an asset class becomes available. Each must cover the following in plain language, readable in under 60 seconds:

| Asset | Required content |
|-------|-----------------|
| Savings Account | What FDIC insurance means; why the return tracks the Federal Reserve; why this preserves but does not build wealth; historical rate context (near 0% in the 2010s, 4.5%+ in 2024) |
| Bonds | What a coupon and maturity date mean; why bond prices fall when interest rates rise; the 2022 crash as the worst year in modern bond history |
| Stocks / Index Funds | What an index fund owns and why it is diversified; what an expense ratio is; 50-year return history including all major crashes and the fact that patient holders recovered every time |
| Options | What a call vs. put option is; what "expiring worthless" means; why most retail options expire worthless; how leverage amplifies both gains and losses |
| Gold | Why gold pays no yield; when it tends to rise (inflation, crises); the 20-year bear market from 1980–2001; its role as a portfolio hedge, not a growth engine |
| Cryptocurrency | What a blockchain is; why value is driven by speculation with no underlying yield; the full bubble-and-crash cycle history; survivorship bias in reported returns |
| Retirement (401k/IRA) | Traditional vs. Roth tax treatment; what employer match means and why it is free money; the early withdrawal penalty; why starting a decade earlier is worth approximately $1,000,000 in final balance |
| Property | How real estate appreciation works; what carrying costs are (mortgage, tax, maintenance); why property is illiquid; historical appreciation rates and the 2008 housing crash |
| Vehicle | Why vehicles are depreciating assets, not investments; total cost of ownership beyond the purchase price; when buying vs. leasing makes sense |

---

## 8. Out of Scope

- User accounts or persistent login
- Real-time financial data or external APIs
- Backend servers or databases — the simulation runs entirely client-side
- Legal or financial advice disclaimers beyond a simple footer note
- Multiplayer features beyond a shareable end-card

---

*This document describes what Life After Grad must do — not how it should be built. All financial parameters are simplified for simulation purposes. Life After Grad is an educational tool, not a financial planning instrument.*
