Feature: User Registration Endpoint (POST /v1/auth/register)
  As a new user
  I want to be able to register an account
  So that I can access the ToDo API

  Background:
    Given the API is running at "http://localhost:3001"
    And the endpoint "/v1/auth/register" is available
    And the request header "Content-Type" is "application/json"

  # Happy Path Scenarios
  Scenario: Successfully register a new user with valid credentials
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                 |
      | email    | john.doe@example.com  |
      | password | SecurePassword123     |
    Then the response status code should be 201
    And the response should contain a "status" field with value "success"
    And the response data should contain the following fields:
      | field     | type   |
      | id        | string |
      | email     | string |
      | createdAt | string |
      | updatedAt | string |
    And the response data "email" should be "john.doe@example.com"
    And the response data "id" should be a valid UUID

  Scenario: Successfully register multiple different users
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | alice@example.com    |
      | password | AlicePassword123     |
    Then the response status code should be 201
    And the response data "email" should be "alice@example.com"

    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | bob@example.com      |
      | password | BobPassword123       |
    Then the response status code should be 201
    And the response data "email" should be "bob@example.com"

  # Validation Error Scenarios
  Scenario: Fail to register with invalid email format
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | invalid-email        |
      | password | SecurePassword123    |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"
    And the response should contain a "message" field

  Scenario: Fail to register with another invalid email format
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    | user@             |
      | password | SecurePassword123 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  Scenario: Fail to register with email without domain
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    | userexample.com   |
      | password | SecurePassword123 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  Scenario: Fail to register with password that is too short
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value           |
      | email    | user@example.com|
      | password | Short1          |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"
    And the response should contain a "message" field

  Scenario: Fail to register with password of exactly 7 characters (minimum is 8)
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value           |
      | email    | user@example.com|
      | password | Pass123         |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  Scenario: Fail to register with empty password
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value           |
      | email    | user@example.com|
      | password |                 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  Scenario: Fail to register with empty email
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    |                   |
      | password | SecurePassword123 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  # Missing Field Scenarios
  Scenario: Fail to register without email field
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | password | SecurePassword123 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"
    And the response should contain a "message" field

  Scenario: Fail to register without password field
    When I send a POST request to "/v1/auth/register" with the following body:
      | field | value           |
      | email | user@example.com|
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  Scenario: Fail to register with empty request body
    When I send a POST request to "/v1/auth/register" with an empty JSON body
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  # Duplicate Registration Scenarios
  Scenario: Fail to register with an email that already exists
    Given a user is already registered with email "existing@example.com"
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | existing@example.com |
      | password | AnotherPassword123   |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"
    And the response message should indicate the user already exists

  Scenario: Fail to register twice with the same credentials
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    | user@example.com  |
      | password | SecurePassword123 |
    Then the response status code should be 201

    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    | user@example.com  |
      | password | SecurePassword123 |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  # Edge Case Scenarios
  Scenario: Successfully register with a long valid email
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                                      |
      | email    | john.doe.smith.johnson@subdomain.example.com |
      | password | VeryLongSecurePassword123456789            |
    Then the response status code should be 201
    And the response should contain a "status" field with value "success"

  Scenario: Successfully register with a strong password containing special characters
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | user@example.com     |
      | password | P@ssw0rd!#2025       |
    Then the response status code should be 201
    And the response should contain a "status" field with value "success"

  Scenario: Successfully register with minimum valid password length (8 characters)
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value           |
      | email    | user@example.com|
      | password | Pass1234        |
    Then the response status code should be 201
    And the response should contain a "status" field with value "success"

  Scenario: Fail to register with whitespace-only fields
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value     |
      | email    |           |
      | password |           |
    Then the response status code should be 400
    And the response should contain a "status" field with value "error"

  # Content-Type Validation
  Scenario: Fail to register with wrong Content-Type header
    When I send a POST request to "/v1/auth/register" with Content-Type "text/plain" and body:
      """
      email=user@example.com&password=SecurePassword123
      """
    Then the response status code should be 400

  # Case Sensitivity Scenario
  Scenario: Register two users with email addresses differing only in case
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value           |
      | email    | User@example.com|
      | password | SecurePass123   |
    Then the response status code should be 201

    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value            |
      | email    | user@example.com |
      | password | SecurePass123    |
    Then the response status code should be 400
    And the response message should indicate the user already exists

  # Response Validation Scenarios
  Scenario: Verify response structure for successful registration
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value             |
      | email    | testuser@test.com |
      | password | TestPassword123   |
    Then the response status code should be 201
    And the response should have the following structure:
      | field  | type   |
      | status | string |
      | data   | object |
    And the response data should have the following structure:
      | field     | type   |
      | id        | string |
      | email     | string |
      | createdAt | string |
      | updatedAt | string |

  Scenario: Verify password is not returned in response
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value                |
      | email    | secure@example.com   |
      | password | SecurePassword123    |
    Then the response status code should be 201
    And the response data should NOT contain a "password" field

  # Timestamp Validation
  Scenario: Verify createdAt and updatedAt timestamps are equal for new registration
    When I send a POST request to "/v1/auth/register" with the following body:
      | field    | value              |
      | email    | timestamp@test.com |
      | password | TimestampTest123   |
    Then the response status code should be 201
    And the response data "createdAt" should be a valid ISO 8601 timestamp
    And the response data "updatedAt" should be a valid ISO 8601 timestamp
    And the response data "createdAt" should equal the response data "updatedAt"
