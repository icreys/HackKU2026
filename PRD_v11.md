# Life After Grad — Product Requirements Document
**Version:** 11.0
**Last Updated:** April 18, 2026
**Status:** Draft

---

## Changelog: v10 → v11

| # | Change |
|---|--------|
| 7 | **Lifestyle Selection System** added — players actively choose housing, food, clothing, and transportation tiers at the start of each year; each category has 3–4 tiered options with distinct monthly costs, secondary effects on health/reputation/happiness, and narrative flavor text |

## Changelog: v9 → v10

| # | Change |
|---|--------|
| 1 | UI visibility standards added — clear layout system, color hierarchy, and action-state indicators specified across all screens |
| 2 | In-game operation instruction panels added for all four action types: Career, Education, Invest, and Work |
| 3 | Starting year range expanded from 1920–2020 to **1920–2026**, with 2021–2026 era data defined |
| 4 | Job selection system redesigned — players now **choose from 3 distinct named job offers** during job change actions, replacing the single unresolved narrative outcome |
| 5 | Invest window close ("×") button removed — the invest action modal must not contain any dismiss or close gesture; only explicit Confirm and Cancel buttons are permitted |
| 6 | Asset return curve panel enhanced — current holdings overlay, projected value at year-end, unrealized gain/loss, and expected profit annotation added |

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

The player also selects a **starting year** from which the simulation runs. The selectable range is **1920 to 2026** (expanded from v9's 1920–2020). This choice determines the historical economic environment the player experiences — the inflation rates, market conditions, interest rate regimes, and major economic events (crashes, booms, recessions, wars, pandemics) that will occur during their simulation. The starting year is a consequential choice: a player beginning in 1929 will face the Great Depression; one beginning in 1970 will face stagflation; one beginning in 2020 will face a global pandemic. The product must surface enough context about each era for the player to make an informed choice.

**2021–2026 era events that must be modeled:**

| Year | Event |
|------|-------|
| 2021 | Post-pandemic stimulus; crypto peak (Bitcoin ~$69K); supply-chain inflation begins |
| 2022 | Highest inflation in 40 years (~8%); Federal Reserve aggressive rate hikes; bond worst year in modern history; crypto crash −77%; stock bear market −20% |
| 2023 | Inflation cooling; banking mini-crisis (SVB collapse); AI boom begins; stocks recover |
| 2024 | Soft landing; Fed rate cuts begin; record stock highs; crypto ETF approval; housing remains unaffordable |
| 2025 | AI reshapes job market; continued disinflation; interest rates stabilize; market volatility |
| 2026 | Players starting in 2026 begin with the most recent known economic conditions as the baseline |

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

#### Operation Instructions — All Action Types

**Every action type must display a persistent instruction tooltip or expandable help panel** the first time the player encounters it, and must remain accessible via a "?" icon thereafter. Instructions must use plain language and be dismissible with one deliberate tap. Instructions must never auto-dismiss.

---

##### Work Action Instructions

The first time the player encounters a work action slot, display the following instruction card:

> **💼 Work Action**
> Choose this to earn money. Each work action pays a portion of your annual salary — instantly added to your cash balance.
>
> - **Default:** Each slot is half-work, half-invest.
> - **Double Work:** Lock both halves as work to earn more this year — but you'll skip an investment opportunity.
> - **Tip:** More work = more income now, but you can't invest at the same time. Balance matters.
>
> *Your salary can grow over time through raises, job changes, and career development.*

---

##### Invest Action Instructions

The first time the player encounters an invest action slot, display the following instruction card:

> **📈 Invest Action**
> Choose this to put your money to work. Select an asset, then use the slider to decide how much to buy or sell.
>
> - **Buy:** Money leaves your cash and enters the asset. It grows (or shrinks) over time.
> - **Sell:** Convert your asset back to cash — but check the cooldown! You must wait at least one action after buying before you can sell.
> - **Cooldown:** An asset you just bought is locked 🔒. The lock disappears after one action.
> - **Tip:** You don't need to do anything each invest action — skipping is valid.
>
> *New asset types unlock as the years pass. A guide card appears the first time each unlocks.*

---

##### Career Action Instructions

The first time the player encounters a career action option, display the following instruction card:

> **🚀 Career Action**
> Use an action slot to make a big career move instead of earning income.
>
> - **Change Jobs:** Sacrifice this action's income. You'll be shown **3 real job offers** — pick the one that fits your goals. Your new salary starts immediately.
> - **Start Grad School:** Commit multiple future action slots to study. No income while studying, but your salary ceiling rises significantly when you finish. Dropping out forfeits all tuition — no benefit.
> - **Tip:** Job changes are risky if your reputation is Poor. Your reputation affects which offers appear and how good they are.
>
> *You can only be in one grad program at a time. Choosing to start one locks out other career actions until it completes.*

---

##### Education (Postgraduate Study) Action Instructions

The first time the player enters a postgraduate study action, display the following instruction card:

> **🎓 Education Action**
> You're investing in yourself instead of earning income right now.
>
> - **While Studying:** This action slot earns $0. Tuition may be deducted from your cash.
> - **When You Finish:** Your maximum possible salary increases significantly. Your reputation improves.
> - **Dropping Out:** If you stop before completing the program, you lose all tuition paid with no benefit. The game will warn you before you drop out.
> - **Tip:** Grad school pays off in the long run — especially if you start early. The salary boost compounds over time.
>
> *Your progress is shown in the career panel. Stay committed — the finish line is worth it.*

---

#### Work Actions

A work action represents the player dedicating time to their career. Each work action produces income **immediately** — the earned amount is added to the player's cash balance the moment the action is confirmed, not at the end of the year.

The amount earned per work action is based on the player's current salary divided by the number of standard work actions in a year. Additional work actions beyond the default earn income at the same per-action rate.

#### Invest Actions

An invest action allows the player to buy or sell one asset class. The player selects the asset and uses a slider to choose the dollar amount to move in or out. The slider must show the player their current balance in that asset and their available cash.

**Sell cooldown:** Any asset that was purchased in a previous action must observe a **one-action cooldown** before it can be sold. If an asset was purchased in action slot N, it cannot be sold until action slot N+2 or later (within the same year or in a future year). The product must clearly indicate which assets are currently available to sell and which are in cooldown.

**Invest window close button policy (new in v10):** The invest action modal — the window where the player selects an asset, reviews holdings, and moves the slider — must **not** contain any "×", close, or dismiss control. The only ways to exit the invest modal are:

1. **Confirm** — commits the transaction and closes the modal.
2. **Cancel** — discards any changes and closes the modal.

This eliminates the accidental dismissal pattern where players close the invest window without completing or explicitly cancelling. Both Confirm and Cancel must be clearly labeled buttons, visually distinct from each other, and placed at the bottom of the modal. The Cancel button must be styled in a lower-emphasis color relative to Confirm.

#### Career Development Actions — Job Selection (Updated in v10)

In addition to standard work and invest actions, the player may spend an action slot on a **career development option**. These represent major life choices that change the player's earning trajectory.

**Job change (switching companies) — v10 redesign**

When the player chooses to change jobs, rather than receiving an unresolved narrative outcome, the product must present the player with **exactly three named job offers** to choose from. Each offer must show:

- The company name (generated, not real)
- The job title
- The offered annual salary
- A one-sentence description of the role and company culture
- An emoji or icon indicating sector (e.g., 🏢 Corporate, 💻 Tech, 🏥 Healthcare, 🎓 Education, 🏗️ Construction, 🍽️ Service)

The three offers must differ meaningfully in salary, sector, and culture. The quality distribution of the three offers must be influenced by the player's current **reputation level**:

| Reputation | Offer quality distribution |
|------------|---------------------------|
| Good | All three offers are at or above current salary; one significantly above |
| Medium | Two offers near current salary; one below |
| Poor | One offer above current salary; two below; one may be a significant step down |

The player must choose one of the three offers. After selection, a short narrative beat confirms the new role. The new salary takes effect immediately for all subsequent work actions in that year.

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

**Return independence from actions:** Investment returns and losses are determined solely by the passage of time — specifically, by how long an asset has been held. The number of invest actions the player takes, or does not take, has no effect on the return rate of any asset. An asset purchased in Year 1 and held through Year 5 must accrue exactly the same return whether the player took three invest actions or six invest actions per year during that period. The only way the player affects their investment outcome is by deciding when to buy, how much to put in, and when to sell.

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

### 5.6 Asset Return Curve Panel (Updated in v10)

The product must display a **persistent side panel** showing a return curve for each asset class that has been unlocked. This panel exists independently of the main game flow and must remain accessible at all times during play without interrupting or replacing the current screen.

Each curve must:

- Represent the historical price or return trajectory of that asset class over approximately the past 50 years (or through 2026 where applicable), expressed as a relative index (not absolute dollar figures)
- Be drawn from real-world historical data, not invented or smoothed for aesthetics — the curves must honestly reflect crashes, recoveries, bear markets, and volatile periods
- Be individually labeled with the asset name
- Visually distinguish periods of gain from periods of loss (e.g., through line color or shading), without requiring the player to read numbers
- Scale consistently within each asset's own chart — assets must not be compared on a shared axis, since their return magnitudes differ by orders of magnitude

The curves serve as reference material for the player's decision-making. They must not change based on the player's choices — they are fixed historical records. However, the panel must **visually highlight the segment of each curve corresponding to the player's chosen starting year and game length**, so the player can see at a glance which portion of the historical record their simulation covers and what conditions they are likely to encounter.

The panel must display all unlocked asset curves simultaneously so the player can compare the character of different assets at a glance — their volatility, their long-run direction, and their behavior relative to each other over time.

#### Portfolio Overlay and Annotations (New in v10)

For each asset the player currently holds, the return curve panel must display an **overlay layer** on top of the historical curve showing the player's actual position. This overlay must include:

| Annotation | Description |
|------------|-------------|
| **Entry marker** | A dot or pin on the curve at the time-point when the player purchased this asset. Labeled with the amount invested. |
| **Current value** | A horizontal line or callout showing the current dollar value of the player's holding in this asset. Updated after every action and event. |
| **Unrealized gain/loss** | Displayed as a colored dollar amount and percentage next to current value. Green for gain, red for loss. |
| **Expected value at year-end** | A projected dotted line extending from the current point to the end of the current in-game year, based on the asset's historical return rate for that year. Labeled "Est. year-end: $X". |
| **Expected value at game-end** | A second projected dotted line extending to the final year of the simulation, based on average historical return for the remaining period. Labeled "Est. at game end: $X (if held)". |
| **Profit annotation** | A shaded region between the entry price line and the current value line. When in profit, shaded green. When at a loss, shaded red. The annotation reads: "Profit: +$X" or "Loss: −$X". |

All projected/expected values must be clearly marked as estimates, not guarantees. A persistent note must appear below each overlay: *"Projections are based on historical averages. Actual results depend on future events."*

The overlay layer must update in real time — immediately after each action confirmation and after each event resolution. Holdings that are in cooldown must display a 🔒 icon on their overlay.

Required curves and their key visual features:

| Asset | Key visual features the curve must show |
|-------|----------------------------------------|
| Savings Account | Smooth, always-positive line; visible rate compression during the 2010s low-rate era; uptick in the early 2020s; stabilization toward 2026 |
| Bonds | Mostly steady upward slope with a visible dip around 2022; gradual recovery by 2024–2026 |
| Stocks / Index Funds | Strong long-run upward slope; visible sharp drops in 2000–02, 2008–09, 2020, and 2022; recovery after each; new highs by 2024 |
| Options | High noise; frequent drops to zero representing expiry; occasional extreme spikes |
| Cryptocurrency | Flat near-zero baseline pre-2013; then extreme peaks and troughs; the 2017, 2021 peaks and 2018, 2022 crashes must be identifiable; recovery and new highs by 2024 |
| Gold | Steep rise to 1980; long flat/declining period through the 1990s; gradual rise from 2001 onward; strong 2020–2026 performance |
| Retirement (401k/IRA) | Mirrors stocks in shape; visually smoother due to the tax-compounding benefit shown as additional area above the stock line |
| Property | Steady long-run appreciation; a visible dip around 2008; recovery and new highs thereafter; continued appreciation through 2026 |
| Vehicle | Continuously declining curve; no recovery; reaches near-zero over 10–15 years |

### 5.7 Knowledge Fact Cards

When an asset class (financial or physical) becomes available for the first time, the product must display a **knowledge fact card** before the player interacts with it. The card must:

- Appear automatically upon first unlock — not require the player to seek it out
- Be dismissible, but require at least one deliberate tap to dismiss (not accidentally skippable)
- Explain what the asset is in plain language
- Describe how gains and losses are generated
- Provide historical context grounded in the asset's real performance over the past 50 years, including both best-case and worst-case periods
- State the asset's risk level relative to the other available assets

See Section 7.2 for the required content of each fact card.

### 5.8 Random Events

Between the player's annual actions and the year summary, **2 to 4 random events must occur every year** without exception. The player cannot avoid events by making different action choices — events happen to everyone.

Events must be presented as narrative story beats in plain language. They must never appear as system alerts or raw data updates.

Events must cover both negative and positive outcomes:

| Category | Examples |
|----------|---------|
| Normal negative | Car breakdown, medical bill, rent spike, burnout, surprise expense |
| Normal positive | Unexpected bonus, side hustle success, raise, networking opportunity |
| Black swan | Layoff, serious illness, market crash affecting all investments, recession, pandemic |
| Windfall | Inheritance, equity payout, gift |

Black swan events must be visually and narratively distinct from normal events. The player must feel them.

The number of events per year (between 2 and 4) must vary — the player must not be able to predict how many events will occur in a given year.

Event probabilities must be influenced by the player's current status (health and reputation), their character profile, and the **historical era in which the simulation is running**. Events that are historically implausible for a given era must not occur — a player starting in 1925 must not encounter a cryptocurrency event; a player starting in 1935 must be exposed to Depression-era economic conditions. Era-specific events (bank runs, wartime rationing, oil embargoes, dot-com euphoria, housing bubbles, COVID-19 pandemic, AI disruption) must be available within their correct historical windows.

**2021–2026 era-specific events** (available only to players whose simulation covers these years):

| Event | Year window | Effect |
|-------|-------------|--------|
| Pandemic remote work boom | 2021 | Positive reputation event; optional lifestyle upgrade |
| Stimulus payment | 2021 | One-time cash windfall |
| Supply-chain expense spike | 2021–2022 | Monthly expenses increase for 1 year |
| Inflation shock | 2022 | All expense categories spike; real value of cash erodes |
| Federal Reserve rate hike | 2022 | Bond values drop; savings account yields rise |
| Crypto collapse | 2022 | All crypto holdings lose 60–80% of value |
| Layoff wave (tech) | 2022–2023 | Risk of job loss event, sector-dependent |
| AI automation disruption | 2024–2026 | Career narrative event; salary could rise or fall depending on role |
| Bank failure scare | 2023 | Negative reputation event; savings account yield narrative |

**Emergency fund rule:** If the player has less than 3 months of expenses in liquid assets (cash + savings account) when a negative financial event occurs, the shortfall must be charged as credit card debt at a high interest rate. If an adequate emergency fund exists, the event is absorbed without new debt.

### 5.9 Financial Simulation Requirements

The simulation must model the following accurately enough to be directionally correct and emotionally credible:

**Income**
- Earned income from each work action is added to the player's cash balance immediately upon action confirmation
- Base income is set by the character profile and grows over time through raises and career events
- Salary growth must be partially offset by inflation — a raise smaller than the inflation rate represents a real-terms pay cut, and the product must make this legible to the player
- Income can decrease due to layoffs, career changes, or postgraduate study

**Inflation**
- The simulation must apply a historically accurate inflation rate for the chosen starting year and era
- Inflation must affect all expense categories each year: housing, food, transport, lifestyle, insurance, and loan payments all rise in nominal terms over time at the prevailing historical rate
- All asset nominal returns must be shown alongside their inflation-adjusted (real) returns where relevant, so the player can distinguish between nominal gains and genuine purchasing-power gains
- The product must communicate to the player when inflation is high enough to meaningfully erode the value of cash holdings or low-yield assets (e.g., a savings account returning 1% during a 7% inflation year is a real loss of purchasing power)
- Historical inflation rates must be sourced from real data for the selected era; the simulation must not use a single fixed rate across all starting years

Representative historical inflation reference by era (annual average):

| Era | Approx. Annual Inflation | Notable characteristic |
|-----|--------------------------|------------------------|
| 1920–1929 | ~−1% to +6% (volatile) | Post-WWI deflation, then stability |
| 1930–1939 | ~−2% to +4% | Great Depression deflation |
| 1940–1949 | ~5–10% | WWII and postwar inflation surge |
| 1950–1969 | ~1–4% | Stable postwar growth |
| 1970–1979 | ~6–13% | Stagflation; oil shocks |
| 1980–1989 | ~4–10% | Peak inflation then rapid decline |
| 1990–1999 | ~2–4% | Disinflation; stable growth |
| 2000–2009 | ~2–4% | Low and stable, crisis deflation scare |
| 2010–2020 | ~1–2% | Persistently below-target inflation |
| 2021–2022 | ~5–9% | Post-pandemic surge; 40-year high |
| 2023–2026 | ~2–4% | Cooling inflation; Fed normalization |

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
- The product must display net worth in both **nominal terms** (actual dollar amount) and **real terms** (inflation-adjusted to the starting year's purchasing power), so the player can see whether they are genuinely building wealth or merely keeping pace with rising prices

### 5.10 Status System

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
- Affects the salary outcome of job changes (including which of the 3 job offers appear), the probability of positive career events, and access to certain opportunities
- Physical asset purchases (property, vehicle) must provide a significant, immediate, and visible boost to reputation

**Happiness**
- Tracked internally and used in the final ending calculation
- **Not displayed to the player at any point** — not as a number, not as a label, not as a bar
- Influenced by income-to-expense balance, health, major life events, and lifestyle choices
- Its effect on the ending must be discoverable through play, not through a visible meter

### 5.11 Ending System

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

### 5.12 Replayability

- The player must be able to restart immediately after seeing their ending
- The three character profiles are re-randomized each new game
- The three job offers presented during job change actions are re-randomized each game
- Choosing a different profile, a different work/invest balance, different career development choices, or different assets must produce meaningfully different outcomes

### 5.13 Lifestyle Selection System (New in v11)

At the **start of each in-game year**, before the player allocates their six action slots, the product must present a **Lifestyle Setup screen** where the player actively chooses their living arrangements for the coming year across four categories:

1. Housing
2. Food
3. Clothing
4. Transportation

Each category presents **tiered options** (3–4 choices). The player must select exactly one option per category before the year begins. The selected options lock in the monthly expense baseline for that year and trigger secondary effects on Health, Reputation, and hidden Happiness.

The total monthly cost of all four selections is displayed as a running sum at the bottom of the screen, updated live as the player makes picks. The player can see whether their projected annual lifestyle cost is within their expected income before committing.

A **"Can I afford this?"** affordability indicator must be displayed prominently. It compares the total projected annual lifestyle cost against the player's expected annual take-home income (after estimated taxes) and shows one of three states:

| State | Condition | Visual treatment |
|-------|-----------|-----------------|
| ✅ Comfortable | Lifestyle cost < 50% of take-home | Green label |
| ⚠️ Stretching | Lifestyle cost 50–75% of take-home | Amber label |
| 🚨 Overextended | Lifestyle cost > 75% of take-home | Red label with warning text |

Players may choose an overextended lifestyle — but the product must make the consequence visible before they confirm. Choices lock in when the player taps **"Start Year →"**.

#### Lifestyle inflation rule

If the player selects an option in a tier higher than their previous year's selection in the same category, the **new tier's cost becomes the permanent minimum floor** for that category going forward — they cannot downgrade to a lower tier without paying a one-time "adjustment cost" (representing lease penalties, wardrobe replacements, social adjustment, etc.). The adjustment cost must be clearly stated before the player confirms a downgrade.

This mechanic models lifestyle inflation: it is easy to upgrade, uncomfortable to downgrade.

---

#### 5.13.1 Housing Options

The player selects their living situation for the year. If the player owns property (purchased via an invest action), the mortgage payment replaces the rental cost; the player still selects an option for home quality tier which affects their maintenance and lifestyle expenses.

| Tier | Name | Monthly Cost | Description | Secondary Effects |
|------|------|-------------|-------------|-------------------|
| 🏚️ Tier 1 | Shared Room / Basement | $400–$700 | You split a cramped apartment with 2–3 roommates or rent someone's basement. The commute is long and the walls are thin. | Health −2/yr (stress, poor sleep); Reputation −5 (hidden); Happiness −5/yr |
| 🏠 Tier 2 | Modest Apartment | $800–$1,400 | A small but functional 1BR or studio in a decent part of town. Not exciting, but it's yours. | No secondary effects (baseline) |
| 🏢 Tier 3 | Nice Apartment / Condo | $1,500–$2,200 | A modern apartment with amenities — gym, doorman, good neighborhood. Colleagues notice. | Reputation +5; Happiness +3/yr |
| 🏡 Tier 4 | Upscale Apartment / Townhouse | $2,300–$3,500 | A premium address. Hosted a dinner party; people were impressed. You feel like you've made it — for now. | Reputation +10; Happiness +5/yr; Lifestyle inflation trap risk ⚠️ |

Cost ranges scale with the **inflation rate** of the chosen era. In high-inflation periods (1970s, 2021–2023), all housing tiers cost proportionally more. The product must show the inflation-adjusted cost for the current year, not a flat number.

**Downgrade adjustment cost:** Moving from Tier 3 or 4 to a lower tier incurs a one-time penalty of 1 month's rent at the vacated tier (representing lease break fees or moving costs).

---

#### 5.13.2 Food Options

The player selects their eating and grocery habits for the year.

| Tier | Name | Monthly Cost | Description | Secondary Effects |
|------|------|-------------|-------------|-------------------|
| 🍜 Tier 1 | Cook at Home / Budget | $180–$280 | Ramen, rice and beans, meal prep Sundays. You're eating fine, just not going out. | Health +2/yr (cooking own meals); Happiness −3/yr (social isolation) |
| 🥗 Tier 2 | Mix of Home and Takeout | $320–$500 | Groceries plus a few restaurant meals a week. A normal balance. | No secondary effects (baseline) |
| 🍣 Tier 3 | Mostly Restaurants / Meal Kits | $550–$800 | Lunch out every day, nicer dinners on weekends. Meal kits for the weekdays. | Health −2/yr (less control over diet); Happiness +4/yr; Reputation +3 (social capital) |
| 🥂 Tier 4 | Fine Dining / Premium | $900–$1,500 | Client dinners, tasting menus, the good stuff. This is how deals get made — or so you tell yourself. | Health −3/yr; Reputation +8; Happiness +6/yr; Lifestyle inflation trap risk ⚠️ |

**Note:** In historical eras with food scarcity events (Great Depression, WWII rationing), Tier 1 may be the only available option for certain years, communicated as a narrative event.

---

#### 5.13.3 Clothing Options

The player selects their wardrobe and personal appearance spending for the year. This is an annual cost, not monthly, divided into a monthly equivalent for the expense calculation.

| Tier | Name | Annual Cost | Monthly Equiv. | Description | Secondary Effects |
|------|------|------------|----------------|-------------|-------------------|
| 👕 Tier 1 | Thrift / Minimal | $200–$500/yr | ~$17–$42/mo | Thrift stores, hand-me-downs, the same five shirts rotated. Functional. Nothing flashy. | Reputation −3 (hidden); Happiness neutral |
| 👔 Tier 2 | Casual / Mid-Range | $600–$1,200/yr | ~$50–$100/mo | A reasonable wardrobe — some quality basics, occasional splurge. Looks put together. | No secondary effects (baseline) |
| 🧥 Tier 3 | Professional / Branded | $1,300–$2,500/yr | ~$108–$208/mo | Quality work clothes, a few name brands, dressing for the job you want. | Reputation +5; Happiness +3/yr |
| 💎 Tier 4 | Designer / Luxury | $2,600–$6,000/yr | ~$217–$500/mo | Statement pieces, limited drops, full designer suits. You look like money. | Reputation +12; Happiness +5/yr; Health neutral; Lifestyle inflation trap risk ⚠️ |

**Note:** Clothing tier is visible to the Job Offer system. Players at Tier 3 or 4 clothing receive a slight upward quality nudge on job offers (reflects professional presentation). Players at Tier 1 clothing may see a minor downward nudge when reputation is already Poor.

---

#### 5.13.4 Transportation Options

The player selects their primary mode of daily transportation. If the player owns a vehicle (purchased via an invest action), vehicle operating costs replace this category and the tier is set automatically based on the vehicle tier purchased. If no vehicle is owned, the player chooses from the following:

| Tier | Name | Monthly Cost | Description | Secondary Effects |
|------|------|-------------|-------------|-------------------|
| 🚶 Tier 1 | Walk / Bike | $0–$30 | No car, no transit pass. You walk or cycle everywhere. Limits where you can live and work. | Health +5/yr (physical activity); Reputation −3 (context-dependent); Happiness −2/yr (time cost); limits job offer geography |
| 🚌 Tier 2 | Public Transit | $80–$160 | Bus, subway, or light rail. Reliable in cities, nonexistent in suburbs. Normal and practical. | Health +1/yr (walking to stops); No reputation effects |
| 🚗 Tier 3 | Economy Vehicle (owned) | $300–$550/mo total* | A used or entry-level new car. Insurance, gas, and maintenance included. Freedom, but a money drain. | Reputation +5; triggers vehicle depreciation asset; opens suburban job market |
| 🚘 Tier 4 | Mid-Range / Premium Vehicle (owned) | $600–$1,100/mo total* | A newer, nicer car. Colleagues notice it in the parking lot. | Reputation +12; triggers vehicle depreciation asset; Happiness +4/yr; Lifestyle inflation trap risk ⚠️ |

*Tiers 3 and 4 reflect total monthly cost of ownership (loan payment or purchase price amortized, insurance, fuel, maintenance). These tiers require a vehicle purchase invest action — selecting them on the Lifestyle screen without an existing vehicle triggers an immediate vehicle purchase flow before the year begins.

**Geographic constraint:** Job offers presented during a job change action must respect the player's transportation tier. Walk/bike players may not receive offers that are implausibly far from their stated housing location. Vehicle owners have access to a broader geographic job pool, including suburban and exurban employers.

---

#### 5.13.5 Lifestyle Summary Card

After the player completes all four selections, the product must display a **Lifestyle Summary Card** before the player proceeds to action allocation. The card must show:

- All four selected tiers with their names and monthly costs
- **Total monthly lifestyle cost**
- **Total annual lifestyle cost**
- Projected annual lifestyle cost as a percentage of expected take-home income
- A plain-language affordability statement (e.g., "Your lifestyle will consume 58% of your take-home income this year. You'll have $X,XXX/year left for saving and investing.")
- Any active secondary effects (e.g., "🏋️ Your home gym access gives you a health bonus this year.")
- Any lifestyle inflation trap warnings (e.g., "⚠️ Downgrading from this tier next year will cost you $1,800.")

The player may go back and revise any category from this summary screen. Once they tap **"Start Year →"**, all selections are locked for the year.

---

#### 5.13.6 Lifestyle and Era Constraints

Certain lifestyle options are unavailable or modified depending on the historical era. The product must enforce the following constraints:

| Era | Constraint |
|-----|-----------|
| 1930–1939 (Depression) | Tier 3 and 4 options for all categories are unavailable; narrative flavor text reflects scarcity |
| 1940–1945 (WWII) | Food Tier 3 and 4 unavailable (rationing); Transportation Tier 3/4 may be restricted (fuel rationing) |
| Pre-1970 | Vehicle tiers are adjusted for era-appropriate vehicle costs and types |
| Pre-2000 | Clothing tier descriptions updated for era-appropriate brands and culture |
| 2021–2022 | All tiers cost 8–12% more due to inflation; a banner alerts the player: "Inflation is running hot. Everything costs more this year." |

---

## 6. UI Visibility Standards (New in v10)

This section defines the minimum visual clarity requirements across all product screens. All screens must conform to these standards.

### 6.1 Color Hierarchy

| Role | Usage | Dark theme color guidance |
|------|-------|--------------------------|
| Primary action | Confirm, main CTA | Bright accent (e.g., teal, green, or gold) — high contrast against background |
| Secondary action | Cancel, back | Muted gray or desaturated accent |
| Positive value | Gains, profit, positive net worth | Green (#4CAF50 or equivalent) |
| Negative value | Losses, debt, negative net worth | Red (#F44336 or equivalent) |
| Neutral/info | Labels, annotations, descriptions | Light gray (#CCCCCC or equivalent) |
| Disabled/locked | Cooldown assets, locked cards | Dimmed with 🔒 icon; opacity 40–50% |
| Warning | Black swan events, emergency alerts | Amber/orange (#FF9800 or equivalent) |
| Background | All screens | Deep dark (#0D0D0D to #1A1A2E range) |
| Surface/card | All cards, modals, panels | Slightly elevated dark (#1E1E2E to #2A2A3E range) |

### 6.2 Typography

- All monetary values must be displayed in a monospace or tabular numeral font to prevent layout shift as values change
- Action labels (Work, Invest, Career, Study) must use a consistent bold label style with an icon prefix
- Instruction text must be visually separated from action UI — use a dimmed background or card inset
- Numbers that change (net worth, cash balance, asset values) must animate briefly (500ms count-up or flash) when updated to draw the player's eye

### 6.3 Action State Indicators

Every action slot must display one of the following states clearly at all times:

| State | Visual treatment |
|-------|-----------------|
| Unset / choosable | Outlined slot with prompt text |
| Work (selected) | Filled slot, 💼 icon, income preview shown |
| Invest (selected) | Filled slot, 📈 icon, asset and amount shown |
| Career (selected) | Filled slot, 🚀 icon, action description shown |
| Study (selected) | Filled slot, 🎓 icon, program progress shown |
| Confirmed / locked in | Full opacity, checkmark ✅, no further editing |

### 6.4 Invest Modal Layout

The invest action modal must follow this layout order, top to bottom:

1. Asset name and icon (header)
2. Knowledge fact card link (if first time; otherwise "Review guide" link)
3. Current holding value and purchase date
4. Unrealized gain/loss (colored, with percentage)
5. Cooldown status (if applicable: 🔒 "Available in X actions")
6. Available cash balance
7. Buy/Sell toggle
8. Amount slider with min/max labels and live dollar readout
9. Transaction summary ("You will buy/sell $X of [Asset]")
10. **Cancel** button (lower emphasis) | **Confirm** button (primary emphasis)

The modal must not contain any close ("×") button, swipe-to-dismiss gesture handler, or any other dismiss mechanism beyond Cancel. This is a hard UI requirement. See Section 5.3 for rationale.

### 6.5 Persistent HUD Elements

The following information must be visible on screen at all times during active gameplay, without requiring navigation or scrolling:

| Element | Location | Format |
|---------|----------|--------|
| Current year | Top bar | "Year 3 of 10" |
| Net worth (nominal) | Top bar | "$XX,XXX" with color coding |
| Net worth (real) | Top bar, below nominal | "Real: $XX,XXX (in [start year] $)" |
| Cash balance | Top bar | "$X,XXX" |
| Health status | Top bar | Good / Medium / Poor with color dot |
| Reputation status | Top bar | Good / Medium / Poor with color dot |
| Action slot progress | Below top bar | "Actions: ● ● ● ○ ○ ○" (filled = confirmed) |
| Current salary | Accessible via tap on HUD | "$XX,XXX/yr" |

### 6.6 Job Offer Selection Screen Layout

When the player triggers a job change action, the following layout must be used:

1. **Header:** "You put the word out. Three opportunities came back." (narrative tone)
2. **Reputation notice:** If reputation is Poor — amber banner: "Your reputation is holding you back. These offers reflect that."
3. **Three offer cards**, each containing:
   - Sector icon + Company name
   - Job title
   - Offered salary (large, bold, colored relative to current salary: green if higher, red if lower, gray if same)
   - Salary delta label: "+$X,XXX vs. current" or "−$X,XXX vs. current"
   - One-sentence role description
   - Select button
4. **"Stay at current job"** link below the cards (forfeits the action slot income but does not trigger a change)
5. No close or dismiss button — the player must make a selection or explicitly stay.

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
| Cryptocurrency | What a blockchain is; why value is driven by speculation with no underlying yield; the full bubble-and-crash cycle history; survivorship bias in reported returns; the 2022 crash and 2024 recovery |
| Retirement (401k/IRA) | Traditional vs. Roth tax treatment; what employer match means and why it is free money; the early withdrawal penalty; why starting a decade earlier is worth approximately $1,000,000 in final balance |
| Property | How real estate appreciation works; what carrying costs are (mortgage, tax, maintenance); why property is illiquid; historical appreciation rates and the 2008 housing crash; 2020–2024 affordability context |
| Vehicle | Why vehicles are depreciating assets, not investments; total cost of ownership beyond the purchase price; when buying vs. leasing makes sense |

---

## 8. Knowledge Hub

The product must include a **Knowledge Hub** — a dedicated screen accessible at any point during or after a playthrough. The Knowledge Hub serves as a persistent educational library that grows as the player progresses through the game.

### 8.1 Purpose

The Knowledge Hub exists separately from the main game flow. It is a space the player can visit voluntarily to review financial concepts, revisit fact cards they have encountered, and track what they have learned. It must not interrupt gameplay — it is accessed on the player's initiative.

### 8.2 Flashcard Collection

The Knowledge Hub must contain a **collection of all knowledge fact cards** available in the game. Each card in the collection has one of two states:

- **Locked** — the player has not yet encountered this asset class in a playthrough. The card is visible in the collection but its content is hidden. The player can see that it exists and what category it belongs to, but cannot read it until it is unlocked through play.
- **Unlocked** — the player has encountered this asset class at least once. The full card content is permanently accessible, regardless of whether the player dismissed it quickly during play.

Once a card is unlocked, it remains unlocked across all future playthroughs. The collection must persist between sessions.

The collection must include a card for every asset class in the game: Savings Account, Bonds, Stocks / Index Funds, Options, Cryptocurrency, Gold, Retirement (401k/IRA), Property, and Vehicle.

### 8.3 Collection Completeness

The Knowledge Hub must display how many cards the player has unlocked out of the total available. This must be communicated as a simple count (e.g., "6 of 9 unlocked") and must motivate the player to try different starting years or asset strategies to unlock the remaining cards.

Cards only available in specific historical eras (e.g., cryptocurrency, which is unavailable before 2009) must be clearly marked as era-dependent, so the player understands they must play a simulation starting in the relevant period to unlock them.

### 8.4 Card Content

Each card in the Knowledge Hub must present the same content as the in-game fact card (see Section 7.2), with no abridgement. The Hub version of each card may additionally include:

- The historical era or year range most relevant to that asset
- A visual mini-chart showing the asset's approximate 50-year return profile, consistent with the return curve panel (Section 5.6) — including the portfolio overlay annotations described in 5.6 where applicable
- A plain-language summary of the single most important thing to understand about that asset

### 8.5 Era Index

The Knowledge Hub must also contain an **Era Index** — a reference list of the major economic periods covered by the game's starting year range (1920–2026). Each era entry must include:

- The approximate year range
- A one-sentence plain-language description of the defining economic characteristic of that period
- Which asset classes were available or dominant during that era
- A rough indication of whether that era is favorable or unfavorable for a new graduate (e.g., entering the workforce in 1929 vs. 1982)

The Era Index is always fully visible — it is not locked or unlocked through play. It exists to help players make informed starting year choices and to provide historical context for events they experience in-game.

**New entries for the Era Index (2021–2026):**

| Era | Description | Favorable for new grad? |
|-----|-------------|------------------------|
| 2021 | Post-pandemic boom; stimulus cash, crypto euphoria, remote work | Mixed — income opportunities high, housing unaffordable |
| 2022 | Inflation shock; Fed rate hikes crush bonds and crypto; bear market | Unfavorable — expenses rise, savings eroded |
| 2023 | Inflation cools; tech layoffs; AI tools emerge; stocks recover | Mixed — depends heavily on sector |
| 2024 | Soft landing; rate cuts; record stock highs; crypto ETF era | Favorable — investment conditions improve |
| 2025–2026 | AI reshaping labor market; disinflation; political uncertainty | Unknown — high variance outcomes |

---

## 9. Out of Scope

- User accounts or persistent login
- Real-time financial data or external APIs
- Backend servers or databases — the simulation runs entirely client-side
- Legal or financial advice disclaimers beyond a simple footer note
- Multiplayer features beyond a shareable end-card

---

## 10. Financial Model Parameters

### 10.1 Asset Return Behavior (50-Year Historical Basis, extended to 2026)

| Asset | Target Avg Annual Return | Volatility | Key historical behavior to reflect |
|-------|--------------------------|------------|-----------------------------------|
| Savings Account | ~1–5% APY (varies with rate environment) | None | Near-zero in low-rate periods (2010s); 4–5%+ in high-rate periods (1980s, 2022–2024) |
| Bonds | ~6–7% nominal avg | Low | Price falls when interest rates rise; worst single year: −13% (2022); recovery 2023–2025 |
| Stocks / Index Funds | ~10–11% nominal avg | Medium | Major crashes: −49% (2000–02), −57% (2008–09), −34% (2020), −20% (2022); full recovery each time |
| Options | High positive avg; high failure rate | Very High | Most retail positions expire worthless; occasional 10× gains |
| Cryptocurrency | Very high nominal avg (2013–2026) | Extreme | −84% crash (2018), −77% crash (2022); also +1,000%+ years; Bitcoin ETF approval 2024 |
| Gold | ~7–8% nominal avg | Low-Medium | 20-year bear market 1980–2001; strong performance during inflation and crisis; 2020–2026 gains |
| Retirement | Mirrors underlying assets + tax/match benefit | Low-Medium | Employer match modeled as an immediate bonus return on eligible contributions |
| Property | ~4–6% annual appreciation avg | Low-Medium | Subject to local market events; illiquid; ongoing carrying costs; 2020–2024 price surge |
| Vehicle | Depreciates ~15–20% per year | None | No investment upside; value declines to near zero over time |

During market crash events, stocks must apply a large negative shock. Gold must respond with a positive shock. Cryptocurrency must apply its most severe negative shock. Property values must decline modestly during recession events.

### 10.2 Career Development Parameters

| Option | Cost | Benefit |
|--------|------|---------|
| Job change | One action slot (no income from that slot); presents 3 job offers; player chooses one | Salary adjustment; quality of offers influenced by reputation |
| Postgraduate study | Multiple action slots across 1–2 years; tuition cost per study action | Significant salary ceiling increase upon completion; Reputation boost |

### 10.3 Expense Reference (Monthly)

Lifestyle expenses for Housing, Food, Clothing, and Transportation are determined by the player's annual tier selections in the **Lifestyle Selection System (Section 5.13)**. The values below reflect the full range across all tiers for each category. Fixed expenses (Health Insurance, Loans) are set by the simulation and not subject to player choice.

#### Player-Selected Lifestyle Expenses

| Category | Tier 1 (Budget) | Tier 2 (Moderate) | Tier 3 (Comfortable) | Tier 4 (Premium) |
|----------|-----------------|-------------------|----------------------|------------------|
| 🏠 Housing (rent) | $400–$700/mo | $800–$1,400/mo | $1,500–$2,200/mo | $2,300–$3,500/mo |
| 🍜 Food | $180–$280/mo | $320–$500/mo | $550–$800/mo | $900–$1,500/mo |
| 👕 Clothing | ~$17–$42/mo | ~$50–$100/mo | ~$108–$208/mo | ~$217–$500/mo |
| 🚌 Transportation | $0–$30/mo | $80–$160/mo | $300–$550/mo | $600–$1,100/mo |
| **Total lifestyle range** | **~$600–$1,050/mo** | **~$1,250–$2,160/mo** | **~$2,458–$3,758/mo** | **~$4,017–$6,600/mo** |

All lifestyle costs scale with the inflation rate of the current era. See Section 5.13.6 for era-specific constraints and surcharges.

#### Fixed Simulation Expenses

| Category | Low | Medium | High |
|----------|-----|--------|------|
| Health Insurance | $150/mo | $300/mo | $500/mo |
| Student Loan Payment | Min = balance × 1%/mo | — | Aggressive = balance × 3%/mo |
| Mortgage Payment | Derived from property price, down payment, and interest rate | — | — |
| Property Tax | 1.2% of home value annually (≈ 0.1%/mo) | — | — |

### 10.4 Tax Rates

| Tax | Rate |
|-----|------|
| Federal Income | Progressive: 10% ($0–$11K), 12% ($11K–$44K), 22% ($44K–$95K), 24% ($95K–$201K), 32% ($201K+) |
| State | 5% flat (simplified) |
| Payroll (FICA) | 7.65% of gross income |
| Capital Gains | 15% on realized investment gains |
| Property | 1.2% of home value annually |

### 10.5 Debt Parameters

| Debt Type | Rate | Trigger |
|-----------|------|---------|
| Student loan | 5.5% APR, compounded quarterly | Exists from game start based on character profile |
| Mortgage | ~6.5% APR, simplified fixed rate | Incurred upon property purchase |
| Credit card | 22% APR, compounded quarterly | Incurred when a negative event hits without an adequate emergency fund |

### 10.6 Win Rate

The simulation must be tuned so that approximately 60% of playthroughs — where the player makes reasonable but not perfect decisions — result in a positive ending. This target applies across all available starting years, including the 2021–2026 expansion.

---

*This document describes what Life After Grad must do — not how it should be built. All financial parameters are simplified for simulation purposes. Life After Grad is an educational tool, not a financial planning instrument.*
