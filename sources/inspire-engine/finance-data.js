/* Inspire FM · Halal Money: Islamic finance for everyday life and business in the UK.
   Sources: Qur'an; hadith (sunnah.com gradings); AAOIFI Shari'ah Standard 21 (equity screening); Islamic Finance Guru (IFG);
   Islamic Portal (Mufti Yusuf Shabbir); Darul Iftaa Birmingham; Darul Uloom Karachi (crypto, 2026); DfE (Alternative Student Finance);
   Nest. UK product details checked November 2026; they change, so always check the provider. Guidance, not a fatwa or financial advice. */
window.IFM_FIN = (function () {
/* verdicts: h = halal, c = halal with conditions, d = scholars differ, a = avoid */
const V = { h: ['Halal', '#15803d'], c: ['With conditions', '#b45309'], d: ['Scholars differ', '#6d28d9'], a: ['Avoid', '#b91c1c'] };

const PRINCIPLES = [
  ['No riba (interest)', 'Any extra paid or received on a loan, fixed in advance, is riba. It is one of the most serious sins in finance.', '"Allah has permitted trade and forbidden riba" (2:275). The Prophet ﷺ cursed the one who consumes riba, the one who pays it, the one who writes it down and its two witnesses, and said "they are all the same" (Muslim 1598).', 'pound'],
  ['No gharar (excessive uncertainty)', 'A deal must be clear: what is sold, the price and when it is delivered. Selling something you don\'t own or can\'t deliver is not allowed.', 'The Prophet ﷺ forbade sales involving gharar (Muslim 1513), and said: "Do not sell what you do not have" (Abu Dawud 3503, Tirmidhi 1232).', 'eye'],
  ['No maysir (gambling)', 'Money won purely by chance, where one side\'s gain is the other\'s loss, is gambling. This includes betting, lotteries and many speculative products.', '"Intoxicants, gambling… are filth from the work of Shaytan, so avoid them" (5:90).', 'x'],
  ['Only halal businesses', 'You can\'t earn from, or invest in, things that are themselves haram: alcohol, pork, gambling, conventional banks and insurers, adult entertainment, and so on.', '"Allah is good and only accepts what is good" (Muslim 1015).', 'shop'],
  ['Share the risk and the reward', 'Islamic finance prefers partnership and real trade: profit is earned by taking a real business risk, not by lending money for a guaranteed return.', 'A widely accepted legal maxim, taken from the hadith "al-kharaj bi\'d-daman" (Abu Dawud 3508): the right to profit comes with bearing the risk.', 'link'],
  ['Honesty and fairness', 'Clear prices, no hiding faults, no cheating on weights, no exploiting people in need.', '"Whoever cheats us is not one of us" (Muslim 102). "If buyer and seller are truthful and clear, their deal is blessed; if they lie and hide things, the blessing is wiped out" (Bukhari 2079).', 'shield'],
];

/* "Is it halal?" A-Z: [title, verdict, short answer, what to do instead / how, tags] */
const CHECK = [
  ['Current account (high street bank)', 'c', 'Keeping money in a normal current account is widely allowed when you need one, as long as it pays no interest or you give any interest away.', 'If it pays interest, switch it off or give it to charity. Al Rayan Bank offers Shariah-compliant current accounts.', 'bank account barclays hsbc lloyds santander monzo starling'],
  ['Savings account with interest', 'a', 'Earning interest on savings is riba.', 'Use a Shariah-compliant savings account (expected profit rate), or invest. If you already received interest, give it away to the poor without expecting reward.', 'savings interest isa cash isa easy access fixed rate'],
  ['What to do with interest you received', 'c', 'Scholars say don\'t keep it, and don\'t leave it with the bank either. Give it to the poor or a public good, without intending reward.', 'Use the interest calculator below to work out what to give away.', 'interest received bank interest give away purification'],
  ['Cash ISA', 'c', 'A normal cash ISA pays interest, so avoid it. Shariah-compliant cash ISAs from Islamic banks pay an expected profit rate instead and are generally accepted.', 'Look for an ISA certified by a Shariah board (for example from Al Rayan or Gatehouse).', 'isa cash isa tax free savings'],
  ['Stocks & shares ISA', 'c', 'Investing is encouraged, but only in Shariah-compliant shares or funds.', 'Choose a halal fund or ETF (e.g. Islamic global equity index funds) or screen each share. See the screening calculator.', 'stocks shares isa trading 212 freetrade vanguard index fund s&p 500 etf'],
  ['Lifetime ISA (LISA)', 'c', 'The 25% government bonus is a grant, not interest, so most scholars allow it, as long as the money inside is invested halal (stocks & shares LISA with halal funds, or a halal cash LISA).', 'Avoid the cash LISA that pays interest. Watch the 25% withdrawal penalty if you don\'t use it for a first home or retirement.', 'lisa lifetime isa first home bonus'],
  ['S&P 500 / normal index funds', 'a', 'A normal index fund holds banks, alcohol and gambling companies and many firms with high interest-based debt.', 'Use an Islamic index fund or ETF that tracks a Shariah-screened index.', 'index fund s&p 500 ftse 100 vanguard tracker'],
  ['Individual shares', 'c', 'Owning part of a halal business is allowed. Under the AAOIFI standard the company\'s interest-based debt and interest-bearing cash must each be under 30% of its market value, and income from haram sources under 5%.', 'Screen the company, and give away (purify) the haram share of any dividends.', 'shares apple tesla amazon nvidia halal stock screening'],
  ['Day trading', 'd', 'Buying and selling real shares is allowed in principle. Scholars warn that constant short-term trading often turns into speculation and gambling-like behaviour.', 'If you trade, use real shares (not CFDs), screen them, avoid margin and short-selling, and don\'t trade with money you can\'t afford to lose.', 'day trading swing trading scalping'],
  ['CFDs, options, futures & spread betting', 'a', 'These are mostly bets on price movements, often with interest-based leverage, and you don\'t own anything real.', 'Own the real asset instead.', 'cfd options futures derivatives spread betting leverage margin'],
  ['Forex trading', 'd', 'Exchanging currencies hand-to-hand (spot) is allowed. Most retail forex apps use leverage, overnight interest (swap) and CFDs, which are not.', 'Only "Islamic / swap-free" spot accounts with no leverage come close, and many scholars still advise against retail forex.', 'forex fx currency trading pips'],
  ['Crypto (e.g. Bitcoin)', 'd', 'Scholars genuinely disagree. Some treat major coins as permissible property; others, including a 2026 ruling from Darul Uloom Karachi, hold that crypto is not currently permissible.', 'If you follow scholars who allow it: avoid leverage, staking that pays interest-like returns, lending and gambling-style tokens. Ask your scholar.', 'crypto bitcoin ethereum btc eth coin nft stablecoin usdt'],
  ['Gold and silver', 'c', 'Buying gold is fine, but gold for money must be exchanged on the spot (hand to hand), because gold, silver and money follow special rules (Muslim 1587).', 'Pay in full and take delivery (or have it allocated in your name) at the time of purchase. Avoid gold on credit or gold "CFDs".', 'gold silver bullion jewellery'],
  ['Premium Bonds', 'a', 'Islamic finance bodies and muftis widely agree they are not allowed: you lend to the government and get a prize instead of interest.', 'Use halal savings or invest instead.', 'premium bonds ns&i prize draw'],
  ['Lottery, scratchcards, betting', 'a', 'Gambling, clearly forbidden in the Qur\'an (5:90).', 'If you struggle to stop, call the National Gambling Helpline 0808 8020 133.', 'lottery lotto scratch card betting bet365 casino slots matched betting'],
  ['Matched betting', 'a', 'Even if "risk-free", it uses gambling contracts and bookmakers\' gambling offers.', 'Find halal side-income instead.', 'matched betting free bets'],
  ['Credit card (paid in full every month)', 'c', 'Many scholars allow it if you need one and are certain to pay in full before any interest is charged; others advise avoiding it because you sign up to an interest clause.', 'Set up a full-balance direct debit. Better still, use a debit card or charge card.', 'credit card amex visa mastercard cashback points'],
  ['Credit card (carrying a balance)', 'a', 'Paying interest is riba.', 'Clear it as fast as you can. Free help: StepChange 0800 138 1111.', 'credit card debt interest balance transfer'],
  ['Klarna, Clearpay & "Pay in 3"', 'c', 'Interest-free pay-in-3 or pay-in-30 is a deferred sale and generally allowed, if you are sure to pay on time. Their "financing" plans charge interest and are not allowed.', 'Only use the interest-free options, never miss a payment, and don\'t let it become a spending habit.', 'klarna clearpay paypal pay in 3 bnpl buy now pay later'],
  ['Overdraft', 'a', 'Arranged and unarranged overdrafts charge interest.', 'Turn it off or keep a buffer so you never go into it.', 'overdraft bank'],
  ['Car finance (PCP / HP)', 'a', 'Standard PCP and HP deals are interest-based loans.', 'Save and buy, or look for Islamic car finance (Ijara / murabaha) from Islamic providers. 0% deals: check there are no hidden interest terms.', 'car finance pcp hp lease'],
  ['Car lease (personal contract hire)', 'd', 'A lease is a hire contract (ijara-like), which many scholars accept. Concerns are the late-payment interest clauses and insurance.', 'Read the terms, avoid deals with interest on late payment where you can, and pay on time.', 'lease contract hire'],
  ['Mortgage (conventional)', 'a', 'A normal mortgage is an interest-based loan. A minority of scholars allowed it in non-Muslim countries out of need, but most say it is not allowed while halal options exist.', 'Use a Home Purchase Plan (HPP). See the Home section.', 'mortgage house home buy remortgage'],
  ['Home Purchase Plan (HPP)', 'h', 'Regulated by the FCA and approved by Shariah boards: you and the provider own the house together, and you buy their share over time while paying rent on it.', 'Compare providers (Gatehouse Bank and StrideUp are the main ones in 2026). Islamic Finance Guru considers HPPs halal.', 'hpp islamic mortgage halal mortgage home purchase plan diminishing musharakah ijara'],
  ['Student loan (England)', 'd', 'The current Student Finance loan charges interest, and scholars differ on whether it is allowed. The government\'s Shariah-compliant Alternative Student Finance is not available yet; DfE\'s timeline points to around August 2027.', 'Check university bursaries and scholarships, ask your scholar, and look out for Alternative Student Finance.', 'student loan student finance university uni tuition fees alternative student finance asf'],
  ['Workplace pension', 'c', 'Pensions are encouraged, but the default fund usually holds haram assets.', 'Switch to your scheme\'s Sharia fund. Nest members can switch to the Nest Sharia Fund at no extra cost. Keep paying in so you get your employer\'s contribution.', 'pension workplace pension nest auto enrolment retirement sipp'],
  ['Insurance (car, home)', 'c', 'Conventional insurance has gharar, but car insurance is a legal requirement, so it is allowed out of need. Takaful (mutual Islamic insurance) is better where available.', 'Only take what you need or what is required. Choose takaful if you can.', 'insurance car insurance home insurance takaful'],
  ['Life insurance', 'd', 'Many scholars say conventional life insurance is not allowed; some allow it out of need (e.g. required with a house purchase).', 'Look for family takaful.', 'life insurance cover'],
  ['Working at a bank', 'd', 'Jobs directly involved in interest deals (writing loans, selling credit) are widely held to be not allowed. Scholars differ on support roles like IT or cleaning.', 'Ask a scholar about your specific role, and look for roles in Islamic or ethical firms.', 'job work bank career'],
  ['Selling alcohol, tobacco or lottery in a shop', 'a', 'Earning from selling alcohol and lottery is not allowed. Tobacco is widely considered haram or strongly disliked today.', 'Many Muslim shopkeepers in the UK have stopped selling them, and found other income lines.', 'off licence corner shop newsagent alcohol cigarettes vape lottery'],
  ['Dropshipping', 'c', 'Selling something you don\'t own yet is not allowed. You can fix this by acting as an agent for a fee (wakalah), or by taking an order and buying the item before you sell it to the customer.', 'Structure it as agency or a "promise to sell", be honest about delivery times, and only sell halal goods.', 'dropshipping shopify amazon fba ecommerce'],
  ['Affiliate marketing', 'c', 'Earning a commission for honest promotion is generally allowed, as long as the product is halal and you don\'t mislead.', 'Disclose your affiliate links and don\'t promote haram products.', 'affiliate marketing commission influencer'],
  ['Selling on credit at a higher price', 'h', 'Charging more for paying later is allowed if the price is fixed at the start (a sale, not a loan). Adding a charge for late payment is not.', 'Agree the full price up front, then never add penalties for lateness (a fixed charity donation clause is a common alternative).', 'instalments credit price murabaha'],
  ['Late payment fees', 'c', 'Charging extra for late payment as profit is riba. A fixed fee covering real admin costs, or a penalty that goes to charity, is accepted by many scholars.', 'If you run a business, send late fees to charity or limit them to genuine costs.', 'late fee penalty invoice'],
  ['Qard hasan (interest-free loan)', 'h', 'Lending without interest to help someone is a highly rewarded act.', 'Write it down with a witness (2:282). Giving extra time to someone in difficulty is better (2:280).', 'interest free loan lend money friend family'],
  ['Zakat on savings & investments', 'h', 'Zakat is due on savings, gold, silver, shares and business stock above the nisab, once a lunar year has passed.', 'Use the Zakat calculator in the Toolbox.', 'zakat nisab calculator'],
];

const HOME = [
  ['How a Home Purchase Plan works', 'You and the provider buy the home together. You pay rent on the part they own, and buy more of their share each month, until the home is fully yours. This is called diminishing musharakah. Some plans use ijara (lease).', 'HPPs are regulated by the FCA and have Shariah boards.'],
  ['Providers in the UK (2026)', 'Gatehouse Bank and StrideUp are the main HPP providers. Al Rayan Bank, the biggest name for years, has paused its home finance. Others such as Wayhome and Heylo offer shared ownership.', 'Products change often, so compare current rates directly or through a broker that specialises in Islamic home finance.'],
  ['Deposit', 'Most HPPs ask for at least a 20% deposit (some offer 10% to 15%). Save in a halal account or halal LISA.', ''],
  ['Is it more expensive?', 'Rates have historically been a little higher than the cheapest mortgages, and choice is smaller. Many people still find the gap small once fees are compared.', ''],
  ['Already have a mortgage?', 'You can usually refinance into an HPP (StrideUp and Gatehouse both offer refinancing). Ask your scholar what to do in the meantime.', ''],
  ['Buy-to-let', 'Halal buy-to-let HPPs exist (for example from Gatehouse). Remember rental income is taxable, and zakat is due on profits you keep, not on the property itself.', ''],
];

const INVEST = [
  ['The AAOIFI screen (30 / 30 / 5)', 'A share is halal if the business is halal and: interest-based debt is under 30% of market value; cash and interest-bearing securities are under 30% of market value; income from haram sources is under 5% of total revenue.', 'This is the standard used by apps like Zoya and Musaffa. Index providers like Dow Jones, S&P, MSCI and FTSE use about 33%, so a share can pass one screen and fail another.'],
  ['Purification', 'If a company passes but earns a little from haram sources, give away that share of your dividends (and, some scholars say, of your gains). Use the purification calculator below.', ''],
  ['Halal funds', 'The easy route: Shariah-screened global equity index funds and ETFs, held in a stocks & shares ISA or SIPP. Managed halal portfolios (for example Wahed) do it all for you.', 'Fees matter. Compare the yearly charge.'],
  ['Sukuk', 'The Islamic alternative to bonds: you own part of a real asset or project and share its income. Useful for lower-risk parts of a portfolio, often through a sukuk fund.', 'The UK government has issued sovereign sukuk.'],
  ['Property', 'Buying property to rent out is a classic halal investment. Property crowdfunding platforms with Shariah structures also exist.', 'Due diligence matters: check the platform is FCA-authorised.'],
  ['Pensions', 'Workplace pension: switch to the Sharia fund (Nest, Aviva, Legal & General, Royal London and others offer one). If yours doesn\'t, ask HR (use the email template), and consider a halal SIPP for extra savings.', 'Never opt out just because the default fund isn\'t halal: you lose your employer\'s money. Switch funds instead.'],
  ['Crypto', 'Scholars disagree (see the A to Z). If you invest, keep it small, avoid leverage and interest-paying "earn" products.', ''],
  ['Start simple', '1. Clear any interest-bearing debt. 2. Build an emergency fund (3 to 6 months) in a halal savings account. 3. Switch your pension to the Sharia fund. 4. Invest regularly in a halal index fund. 5. Pay zakat every year.', 'This order follows widely used personal finance advice, adapted for halal products.'],
];

const DEBT = [
  ['Why Islam takes debt seriously', 'The Prophet ﷺ sought refuge from being overwhelmed by debt every day (Bukhari 6369), and would not lead the funeral prayer of someone who died in debt until it was paid off (Bukhari 2289). "The believer\'s soul is held hostage by his debt until it is paid" (Tirmidhi 1078).', ''],
  ['Lending is kindness', '"If the debtor is in difficulty, give him time until it is easier. And if you forgive it as charity, that is better for you" (2:280). Write debts down with witnesses (2:282, the longest ayah in the Qur\'an).', ''],
  ['Get out of debt step by step', 'List everything you owe. Pay priority bills first (rent, council tax, energy). Stop new borrowing. Call a free debt charity: they can freeze interest and set up a plan. Make the dua for debt every day.', 'Free help: StepChange 0800 138 1111, National Debtline 0808 808 4000, Citizens Advice Luton 0808 278 7847.'],
  ['Budget the Muslim way', 'A simple monthly budget: needs, debt repayment, savings, sadaqah, then wants. Giving even a little regularly brings barakah: "Charity does not decrease wealth" (Muslim 2588).', ''],
  ['Interest-free help', 'In Luton, Muslim charities, masjids and family qard hasan schemes sometimes help with interest-free loans. Ask your masjid. Never use payday lenders or loan sharks.', ''],
];

const BIZ = [
  ['Earn with your own hands', '"No one has ever eaten better food than what he earned with his own hands" (Bukhari 2072). Running an honest business is worship.', 'pencil'],
  ['The honest trader', '"The truthful, trustworthy merchant will be with the prophets, the truthful and the martyrs" (Tirmidhi 1209, hasan). Be truthful about faults, prices and delivery times.', 'shield'],
  ['No cheating', 'The Prophet ﷺ put his hand into a pile of grain and found it wet underneath, and said: "Whoever cheats us is not one of us" (Muslim 102). Don\'t hide damage, fake reviews or inflate "was" prices.', 'eye'],
  ['Be easy-going', '"May Allah have mercy on a man who is easy-going when he sells, when he buys and when he asks for what he is owed" (Bukhari 2076).', 'smile'],
  ['Pay your staff on time', '"Give the worker his wages before his sweat dries" (Ibn Majah 2443, graded sahih by al-Albani). Pay at least the National Living Wage, give contracts and payslips, and treat staff with dignity.', 'person'],
  ['No hoarding', '"No one hoards except a sinner" (Muslim 1605): holding back essential goods to push prices up.', 'bag'],
  ['Write contracts', 'Allah tells us to write down deals and debts (2:282). Partnerships especially need a written agreement: capital, roles, profit split, losses, exit.', 'checklist'],
  ['Keep your word', '"O you who believe, fulfil your contracts" (5:1).', 'check'],
  ['Halal products and marketing', 'Only sell halal goods and services. Advertising must be truthful and modest.', 'star'],
  ['Pay zakat on the business', 'Zakat is due on stock for sale, cash and money owed to you, valued each zakat year (not on equipment or premises).', 'pound'],
  ['Tax and the law', 'Paying taxes, registering the business and following employment, food-safety and licensing rules are part of fulfilling your agreements with society.', 'home'],
  ['Sadaqah from profits', 'Many Muslim businesses set aside a fixed share of profit for charity. "Charity does not decrease wealth" (Muslim 2588).', 'heart'],
];

const CONTRACTS = [
  ['Murabaha', 'Cost-plus sale', 'The financier buys an item and sells it to you at a stated mark-up, paid now or in instalments. Used for asset and trade finance.'],
  ['Ijara', 'Lease', 'The owner rents an asset to you for a fee. Ijara wa iqtina is a lease that ends with you owning it.'],
  ['Musharakah', 'Joint partnership', 'Partners put in capital, share profits as agreed and share losses by capital. Diminishing musharakah is used in HPPs.'],
  ['Mudarabah', 'Investor and manager', 'One side gives money, the other gives skill and work. Profits are split by agreement; financial loss falls on the investor unless the manager was negligent.'],
  ['Wakalah', 'Agency', 'Someone acts for you for a fee. Used in takaful, investment management and some dropshipping models.'],
  ['Salam', 'Forward purchase', 'Full price paid now for goods delivered later, with exact specification. Allowed by the Sunnah for farmers and makers.'],
  ['Istisna\'', 'Made to order', 'Paying for something to be manufactured or built, often in stages (houses, furniture, machinery).'],
  ['Qard hasan', 'Goodly loan', 'An interest-free loan. Only the amount lent is repaid.'],
  ['Takaful', 'Mutual insurance', 'Members pay into a shared fund that helps whoever suffers a loss; the operator takes a fee.'],
  ['Sukuk', 'Islamic certificates', 'Ownership shares in an asset or project that pay you a share of its income.'],
];

const SRC = [
  ['AAOIFI Shari\'ah Standard 21 explained (Musaffa)', 'https://musaffa.com/screening-methodology/'],
  ['Zoya: how Shariah compliance is determined', 'https://help.zoya.finance/en/articles/4189798-how-do-you-determine-shariah-compliance'],
  ['Islamic Finance Guru: Islamic mortgages in the UK', 'https://www.islamicfinanceguru.com/articles/islamic-mortgages-uk-definitive-guide'],
  ['Islamic Finance Guru: are Premium Bonds halal?', 'https://forum.islamicfinanceguru.com/t/fatwa-are-premium-bonds-halal-or-haram/26'],
  ['Islamic Finance Guru: crypto, what different scholars say', 'https://www.islamicfinanceguru.com/articles/scholars-who-say-cryptocurrency-is-haram-and-those-who-say-its-halal'],
  ['DfE: Alternative Student Finance', 'https://educationhub.blog.gov.uk/2025/06/alternative-student-finance-how-were-making-student-finance-accessible-to-everyone/'],
  ['Hyphen: no date yet for halal student loans (Aug 2026)', 'https://hyphenonline.com/2026/08/06/halal-student-loans-alternative-student-finance-rollout-2027/'],
  ['Which?: Nest fund choices incl. the Nest Sharia Fund', 'https://www.which.co.uk/reviews/company-pensions/article/pensions-auto-enrolment-explained/nest-pension-how-it-works-a5sgg6L41pLD'],
  ['Hadith references: sunnah.com', 'https://sunnah.com'],
];
return { V, PRINCIPLES, CHECK, HOME, INVEST, DEBT, BIZ, CONTRACTS, SRC };
})();
