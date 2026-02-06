Feature: Wallet model and selector

Scenario: Maximum four wallets across the app
  Given I already have 4 wallets total
  When I try to create another wallet
  Then creation is blocked
  And I see an in-app modal explaining the 4-wallet limit

Scenario: Wallet cards show only visible wallets
  Given wallet A is enabled
  And wallet B is disabled but has transactions
  And wallet C is disabled and has no cash, no transactions, and is not default
  When I open Cash
  Then I see wallet cards for A and B
  And I do not see wallet C

Scenario: Wallet card selection switches immediately
  Given I see at least two wallet cards
  When I click another wallet card
  Then that wallet becomes the active wallet immediately

Scenario: Wallet cards are reorderable
  Given I see at least two wallet cards
  When I drag a wallet card to a new position
  Then the wallet order is updated and persisted
  And the same order is shown in Transactions

Scenario: Cash wallet selector includes add-wallet card
  Given I am on Cash
  Then I see a `+` wallet card at the end of the wallet row
  When I click the `+` wallet card and I have fewer than 4 wallets
  Then a create-wallet modal opens

Scenario: Add-wallet card at max wallets shows limit modal
  Given I already have 4 wallets total
  And I am on Cash
  When I click the `+` wallet card
  Then I see an in-app modal explaining the 4-wallet limit

Feature: Cash denomination presentation

Scenario: Bills and coins are separated with totals
  Given the active wallet has both bill and coin denominations
  When I open Cash
  Then I see a Bills/Coins toggle
  And I see a Bills total row in the denominations section
  And I see a Coins total row when I switch to Coins

Scenario: Denomination rows are static outside Edit Mode
  Given I view denomination rows in Cash
  Then each row communicates Denomination × Count = Subtotal
  And counts are shown as read-only values by default
  And no inline edit controls are shown outside Edit Mode

Scenario: Zero-count rows are always de-emphasized
  Given a denomination row has count 0
  When I open Cash
  Then the row is visually de-emphasized
  And the row remains visible
  And the row can still be edited after entering Edit Mode

Scenario: Hide zero-count denominations in Cash
  Given I am on Cash and the active wallet has at least one zero-count denomination
  When I toggle Hide empty on
  Then zero-count rows are hidden from the list
  When I toggle Hide empty off
  Then zero-count rows are shown again and remain de-emphasized

Scenario: Denomination rows clearly show have vs missing
  Given I open Cash
  Then each denomination row shows whether I currently have that denomination or it is missing

Feature: Edit mode reconciliation and gating

Scenario: Enter edit mode requires in-app modal
  Given I am on Cash
  When I click the wallet actions icon
  And I choose Edit denominations
  Then I see an in-app modal saying "Edit denominations instead of entering a transaction?"
  And I can choose Cancel or Enter edit mode

Scenario: Finish is enabled only when reconciled
  Given I am in edit mode
  And denominations total does not equal expected balance
  Then Finish edit is disabled
  And the reconciliation status pill uses danger styling across the whole pill area
  And I see either "You're short by X" or "You're over by X"
  When denominations total equals expected balance
  Then Finish edit becomes enabled
  And the reconciliation status pill uses success styling across the whole pill area

Scenario: Cancel edit restores snapshot
  Given I am in edit mode and changed counts
  When I click Cancel edit
  Then my denomination counts revert to the pre-edit snapshot

Scenario: Edit mode creates audit transaction
  Given I am in edit mode
  And I change denomination counts
  And totals reconcile exactly
  When I click Finish edit
  Then a transaction of type denominations_edited is recorded
  And the amount is 0
  And the optional reason is stored in note when provided

Scenario: Denomination controls are editable only in Edit Mode
  Given I am not in edit mode on Cash
  Then I cannot directly modify denomination counts
  When I enter edit mode
  Then each denomination row shows a stable `- input +` count control
  And I can type multi-digit counts

Scenario: Edit mode gates navigation
  Given edit mode is active
  When I try to navigate to another section
  Then all sections except Settings are disabled

Feature: Payments modes and allocation gating

Scenario: Payments defaults to outgoing mode
  Given I open Pay
  Then Outgoing mode is selected by default

Scenario: Payments entry controls match Cash visual language
  Given I open Pay in desktop layout
  Then Amount is rendered in the entry card as a standard-sized input (not oversized hero typography)
  And Amount has constrained width and does not stretch awkwardly full-width
  And Amount and Note/Reference use consistent spacing/alignment

Scenario: Payments strategy options include equalisation
  Given I open Settings
  Then Default strategy options include greedy, lex, and equalisation
  And each option has clear explanatory text

Scenario: Note length limit is enforced
  Given I enter a note longer than 30 characters
  Then the note input accepts only 30 characters

Scenario: Denominations are filtered by amount when Suggestions are on
  Given Suggestions are ON in Settings
  And I enter a payment amount
  Then denominations greater than the amount are not shown

Scenario: Suggestions off shows all currency denominations
  Given Suggestions are OFF in Settings
  And I enter a payment amount
  Then I see all denominations for that wallet currency
  And denominations with 0 count are visible with available 0

Scenario: Show all denominations reveals full list
  Given Suggestions are ON in Settings
  And I enter a payment amount
  And the payment list is filtered by amount
  When I click Show all denominations
  Then I see all denominations for that currency

Feature: Transactions view and retention

Scenario: Retention banner dismisses for 5 days
  Given I am on Transactions
  When I dismiss the retention banner
  Then it stays hidden for 5 days

Scenario: Transactions default vs details view
  Given I am on Transactions
  Then each row shows Description, Amount, and Balance in a table
  And each row is clickable to expand
  When I click a row
  Then I see a label → value list with full timestamp, direction, strategy, breakdown, change, and full note

Scenario: Transactions header updates with wallet selection
  Given I am on Transactions with wallet A selected
  Then I see a header showing wallet A name/currency and balance
  When I select wallet B
  Then the header updates immediately to wallet B name/currency and balance

 
Feature: Mobile navigation

Scenario: Bottom nav shows Cash Pay Trx
  Given I am on a mobile viewport
  When I view the app
  Then the bottom nav shows exactly: Cash, Pay, Trx
  And Pay is in the middle
  And Pay is visually emphasized on mobile

Scenario: Wallet row is the only horizontal scroll region
  Given I am on a mobile viewport
  When I open Cash
  Then the wallet cards row can scroll horizontally
  And the rest of the page does not scroll horizontally

Scenario: Wallet actions are accessed via icon
  Given I am on Cash
  Then I see a wallet actions icon on the selected wallet
  When I click the icon
  Then I see Edit name, Edit denominations, and Delete wallet actions
  And I see a Close control in the top-right
  And there is no in-list Cancel action

Scenario: Settings is accessible via gear icon
  Given I am on a mobile viewport
  When I open Cash, Pay, or Trx
  Then I see a top-right settings icon
  When I click the settings icon
  Then a Settings overlay opens
  And I can close it via Close or outside click

Scenario: Cash does not show Add/Spend CTA
  Given I am on Cash
  Then I do not see an Add/Spend money button

Scenario: Pay is first-class
  Given I am on the app
  When I select Pay from the bottom nav
  Then the payment flow is shown as a full screen tab

Scenario: Pay uses active wallet context
  Given I have selected wallet A in Cash
  When I open Pay
  Then I see a selected wallet summary for wallet A
  And I do not see a wallet selector row in Pay


Scenario: Revert is per wallet latest only
  Given I have multiple transactions in a wallet
  When I expand the latest transaction for that wallet
  Then I see a Revert transaction button
  When I expand any older transaction for that wallet
  Then I do not see a Revert transaction button

Feature: Coins rules preference

Scenario: Prefer notes uses notes when exact is possible
  Given Avoid coins is enabled in Settings
  And Coins mode is set to Prefer notes
  And an exact payment can be made using notes only
  When I enter a payment amount
  Then the suggested breakdown uses notes only

Scenario: Prefer notes allows coins when notes cannot pay exactly
  Given Avoid coins is enabled in Settings
  And Coins mode is set to Prefer notes
  And an exact payment cannot be made using notes only
  But an exact payment can be made when coins are allowed
  When I enter a payment amount
  Then the suggested breakdown includes coins as needed

Scenario: Prefer notes overpay minimises coins before overpay
  Given Avoid coins is enabled in Settings
  And Coins mode is set to Prefer notes
  And no exact payment is possible
  And pay-with-change is enabled
  When I enter a payment amount
  Then the suggested tender uses the fewest coins even if it increases overpay

Feature: Strategy selection

Scenario: Lex prefers higher denominations when multiple exact solutions exist
  Given the wallet has denominations that allow multiple exact breakdowns
  And Lex is selected as the strategy
  When I enter an outgoing payment amount
  Then the suggested breakdown uses more higher denominations in preference order

Scenario: Equalisation balances remaining counts
  Given the wallet has multiple exact solutions
  And Equalisation is selected as the strategy
  When I enter an outgoing payment amount
  Then the suggested breakdown leaves remaining counts more balanced than an alternative exact breakdown

Scenario: Avoid coins entirely refuses coin usage
  Given Avoid coins is enabled in Settings
  And Coins mode is set to Avoid coins entirely
  And a payment can only be made using coins
  When I enter a payment amount
  Then the payment is marked insufficient

Feature: Payment strategies and change suggestions

Scenario: Payment strategies off disables suggestions
  Given Payment strategies are turned Off in Settings
  When I open Pay and enter an amount
  Then I do not see suggested denominations
  And I can only enter denominations manually

Scenario: Change suggestions off forces manual change entry
  Given Payment strategies are On
  And Change suggestions are Off
  And I enter an outgoing payment that requires receiving change
  When I finalize the payment
  Then I am prompted to enter change received manually
  And no suggested change is shown

Scenario: Payments status backgrounds are dark-mode readable
  Given I am using dark mode
  And I open Payments with a sufficient-not-exact outgoing setup
  Then the warning suggestion container uses the same dark-safe amber treatment as Transactions warning banners
  When I open Payments with insufficient funds
  Then the danger suggestion container uses a dark-safe red treatment with readable contrast

Scenario: Allocation is mandatory for outgoing and incoming
  Given I entered amount and note on Payments
  And denomination allocation does not yet equal the amount
  Then Apply is disabled
  When allocation equals the amount exactly
  Then Apply is enabled

Scenario: Outgoing non-exact allows tender with change
  Given I am in Outgoing mode on Payments
  And exact composition is unavailable but wallet total is sufficient
  When I enter amount and note
  Then I see a strategy-based suggested paid breakdown
  And I see expected change
  When allocated total is greater than entered amount
  Then Apply is enabled

Scenario: Suggested outgoing breakdown can prefill allocation
  Given I am in Outgoing mode on Payments
  And a strategy suggestion is shown
  When I click Use suggested
  Then allocation is prefilled with suggested denominations

Scenario: Exact outgoing suggestion uses finalize wording
  Given I am in Outgoing mode on Payments
  And the strategy suggestion is exact
  Then the primary suggested action label is "Use and finalize"

Scenario: Outgoing manual editor is hidden until suggestion is rejected
  Given I am in Outgoing mode on Payments
  And a strategy suggestion is shown
  Then denomination manual editor is hidden by default
  And Bills/Coins toggle is hidden by default
  When I click Edit manually
  Then denomination manual editor is shown

Scenario: Outgoing with change requires received-change confirmation
  Given I am in Outgoing mode on Payments
  And allocated total is greater than entered amount
  When I click Apply outgoing
  Then I see a change-confirmation popup with expected change and suggested received-change breakdown
  When I confirm suggested change in the popup
  Then outgoing transaction is finalized
  When I reject suggested change and choose manual
  Then transaction finalization is blocked until received change total matches expected change

Scenario: Payment entry can be cancelled before apply
  Given I entered payment details on Payments
  When I click Cancel
  Then the in-progress payment entry is cleared

Scenario: Change denomination override is constrained
  Given I am in outgoing change-confirmation step
  Then I can only allocate received-change denominations with values less than or equal to expected change
  And I can accept suggested change breakdown or override it before final confirmation

Scenario: Note/reference is optional
  Given I am on Payments
  When I leave note/reference empty
  Then I can still proceed if amount and allocation rules are satisfied

Scenario: Incoming uses suggestion-first flow
  Given I am in Incoming mode on Payments
  And a valid suggestion is available
  Then manual denomination editor is hidden by default
  And primary action label is "Use and finalize"
  When I click Edit manually
  Then manual denomination editor is shown with zero counts

Scenario: Amount input supports normal editing
  Given I am on Payments
  When I type a multi-digit amount and then paste another amount
  Then the field accepts both typed and pasted values
  And no browser spinner affordance is shown

Scenario: Payments denomination UI mirrors Cash pattern
  Given I entered a valid amount on Payments
  Then I see Bills/Coins tabs when both categories exist
  And rows communicate Denomination, Count, and Subtotal columns
  And count controls keep the same stable - input + pattern as Cash

Scenario: Only latest transaction can be reverted
  Given I have transaction history
  Then only the global latest transaction has a visible revert action
  When I revert the latest transaction
  Then that transaction is removed
  And wallet denominations are restored to the pre-transaction state

Feature: Transactions table columns

Scenario: Default column layout
  Given I open Transactions
  Then Description, Amount, and Balance columns are visible
  And there is no Wallet column

Feature: Modal interaction

Scenario: Modals close on outside click and Escape
  Given I open any in-app modal
  When I click outside the modal
  Then the modal closes
  When I press Escape
  Then the modal closes

Scenario: Settings shows app version
  Given I open Settings
  Then I see the app version at the bottom

Feature: Button color rules

Scenario: Cancel actions are neutral
  Given I see a Cancel action in a modal or flow
  Then it uses the neutral button style
  And red is reserved for destructive actions only
