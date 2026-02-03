# Acceptance Tests (Gherkin)

Feature: Denominations and payments

Scenario: Setting denominations
Given I open the Cash On Hand screen
When I set counts for each denomination
Then the total cash on hand updates to the correct sum

Scenario: Successful greedy payment
Given my cash on hand is sufficient
And I choose strategy "greedy"
When I enter a payment amount that can be made exactly
Then I see a breakdown that matches the greedy strategy
And I can apply the payment

Scenario: Successful lex payment
Given my cash on hand is sufficient
And I choose strategy "lex"
When I enter a payment amount that can be made exactly
Then I see a breakdown that matches the lex strategy
And I can apply the payment

Scenario: Insufficient funds
Given my total cash on hand is less than the payment amount
When I request a payment breakdown
Then I see the failure reason "insufficient total funds"
And no transaction is recorded

Scenario: Cannot make exact amount
Given my total cash on hand is at least the payment amount
And no exact combination exists
When I request a payment breakdown
Then I see the failure reason "cannot make exact amount with available denominations"
And no transaction is recorded

Scenario: Transaction recorded with correct breakdown
Given I have an exact breakdown suggested
When I apply the payment
Then a transaction is recorded with the amount, strategy, and breakdown used
And my cash on hand counts decrease accordingly

Scenario: Retention purge removes old transactions
Given there are transactions older than 30 days
When the app loads or a new transaction is recorded
Then transactions older than 30 days are deleted
And recent transactions remain

Scenario: Export and import round-trip
Given I have denominations, settings, and recent transactions
When I export to JSON and immediately import that file
Then the app state matches the pre-export state

Scenario: Delete all data
Given I have stored denominations, settings, and transactions
When I use "Delete all data"
Then all local data is removed
And the app returns to default settings
