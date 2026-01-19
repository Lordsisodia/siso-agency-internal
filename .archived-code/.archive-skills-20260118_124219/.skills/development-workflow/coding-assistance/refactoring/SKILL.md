---
name: refactoring
category: development-workflow/coding-assistance
version: 1.0.0
description: Code refactoring patterns, techniques, and best practices for improving code structure without changing behavior
author: blackbox5/core
verified: true
tags: [refactoring, code-quality, maintenance, clean-code]
---

<skill>
  <metadata>
    <name>refactoring</name>
    <category>development-workflow/coding-assistance</category>
    <version>1.0.0</version>
    <last_updated>2025-01-18</last_updated>
    <status>production-ready</status>
  </metadata>

  <context>
    <section title="What is Refactoring?">
      <p>
        Refactoring is the disciplined technique for restructuring an existing body of code,
        altering its internal structure without changing its external behavior. The heart of
        refactoring is a series of small behavior-preserving transformations. Each transformation
        (called a 'refactoring') does little, but a sequence of these transformations can produce
        a significant restructuring. Since each refactoring is small, it's less likely to go wrong.
        The system is also kept working at each step, reducing the chances that a system can get
        so broken that it can't be compiled.
      </p>
    </section>

    <section title="Why Refactoring Matters">
      <ul>
        <li><strong>Improved Code Quality:</strong> Makes code easier to understand and modify</li>
        <li><strong>Bug Prevention:</strong> Cleaner code has fewer hiding places for bugs</li>
        <li><strong>Faster Development:</strong> Well-structured code is quicker to work with</li>
        <li><strong>Technical Debt Reduction:</strong> Pays down accumulated complexity</li>
        <li><strong>Knowledge Transfer:</strong> Self-documenting code helps team understanding</li>
        <li><strong>Testability:</strong> Refactored code is easier to test</li>
        <li><strong>Performance Opportunities:</strong> Clean structure enables better optimization</li>
      </ul>
    </section>

    <section title="When to Refactor">
      <ul>
        <li><strong>Rule of Three:</strong> "Do it once" (just get it done), "Do it twice" (wince at duplication), "Do it three times" (refactor)</li>
        <li><strong>Code Reviews:</strong> When reviewing code that could be clearer</li>
        <li><strong>Adding Features:</strong> Refactor when the current structure makes new features difficult</li>
        <li><strong>Fixing Bugs:</strong> Refactor when code is hard to understand or debug</li>
        <li><strong>Code Smells:</strong> When you detect signs of poor design (duplicated code, long methods, etc.)</li>
        <li><strong>Pre-commit:</strong> Clean up code before committing if it doesn't change behavior</li>
      </ul>
    </section>

    <section title="When NOT to Refactor">
      <ul>
        <li><strong>Dead Code:</strong> Code that's about to be deleted shouldn't be refactored</li>
        <li><strong>Tight Deadlines:</strong> When a rewrite is scheduled soon, skip major refactoring</li>
        <li><strong>Without Tests:</strong> Never refactor code that lacks test coverage</li>
        <li><strong>"Just Because":</strong> Refactor with purpose, not aimlessly</li>
        <li><strong>Production Emergencies:</strong> Focus on hotfixes, refactor afterwards</li>
      </ul>
    </section>
  </context>

  <instructions>
    <section title="Core Refactoring Principles">
      <subsection title="1. Safety First">
        <p>
          Never change code without having tests that prove the behavior is preserved.
          Refactoring without tests is just changing code, not refactoring.
        </p>
        <checklist>
          <item>Ensure test coverage exists for code being modified</item>
          <item>Run tests before starting refactoring</item>
          <item>Run tests after each small refactoring step</item>
          <item>Commit after each successful refactoring</item>
        </checklist>
      </subsection>

      <subsection title="2. Small Steps">
        <p>
          Break refactoring into tiny, verifiable steps. Each step should be small enough
          that you can easily understand what changed and verify it works.
        </p>
        <checklist>
          <item>Make one change at a time</item>
          <item>Test after each change</item>
          <item>Keep changes compilable at all times</item>
          <item>Never batch multiple refactoring together</item>
        </checklist>
      </subsection>

      <subsection title="3. Behavioral Equivalence">
        <p>
          Refactoring must preserve the external behavior of the code. The inputs and
          outputs must remain identical from the user's perspective.
        </p>
        <checklist>
          <item>No new features should be added during refactoring</item>
          <item>No bugs should be fixed during refactoring (separate concern)</item>
          <item>APIs should remain stable unless that's the explicit refactoring goal</item>
          <item>Performance should not be the primary goal (though it may improve)</item>
        </checklist>
      </subsection>

      <subsection title="4. Compile and Test">
        <p>
          The code should compile and pass all tests after each refactoring step.
          This creates a rhythm: change, test, commit. If tests fail, rollback immediately.
        </p>
      </subsection>

      <subsection title="5. Version Control Discipline">
        <p>
          Each refactoring should be in its own commit, clearly describing what changed
          and why. This makes it easy to revert individual refactoring if needed.
        </p>
        <example_commit_message>
          refactor(auth): extract validation logic into validateCredentials()

          - Extracts credential validation from authenticate() method
          - Improves testability of validation logic
          - No behavior changes
        </example_commit_message>
      </subsection>
    </section>

    <section title="Refactoring Process">
      <steps>
        <step order="1">
          <title>Identify the Code Smell</title>
          <description>Find code that needs improvement (duplicated code, long method, etc.)</description>
        </step>
        <step order="2">
          <title>Ensure Test Coverage</title>
          <description>Write tests if they don't exist. Never refactor without tests.</description>
        </step>
        <step order="3">
          <title>Choose Appropriate Refactoring</title>
          <description>Select the refactoring technique that addresses the specific smell</description>
        </step>
        <step order="4">
          <title>Apply Refactoring in Small Steps</title>
          <description>Make tiny changes, testing after each step</description>
        </step>
        <step order="5">
          <title>Verify Tests Pass</title>
          <description>Ensure all tests still pass after each change</description>
        </step>
        <step order="6">
          <title>Review and Commit</title>
          <description>Review the changes, ensure behavior is preserved, commit</description>
        </step>
      </steps>
    </section>

    <section title="Test Coverage Requirements">
      <p>
        Before refactoring any code, ensure adequate test coverage:
      </p>
      <requirements>
        <requirement priority="critical">Unit tests for all code paths being refactored</requirement>
        <requirement priority="critical">Integration tests for interactions with other components</requirement>
        <requirement priority="high">Edge case tests for boundary conditions</requirement>
        <requirement priority="high">Error handling tests for failure scenarios</requirement>
        <requirement priority="medium">Performance tests if behavior has performance aspects</requirement>
      </requirements>
    </section>
  </instructions>

  <rules>
    <section title="Golden Rules of Refactoring">
      <rule id="1" priority="critical">
        <title>Never Refactor Without Tests</title>
        <description>
          If code doesn't have tests, write them first. Refactoring without tests is
          reckless and will introduce bugs. This is the most important rule.
        </description>
        <enforcement>
          Fail-fast: Attempt to refactor untested code should trigger immediate warning
        </enforcement>
      </rule>

      <rule id="2" priority="critical">
        <title>Preserve Behavior</title>
        <description>
          Refactoring must not change what the code does, only how it does it.
          Inputs and outputs must remain identical.
        </description>
      </rule>

      <rule id="3" priority="high">
        <title>One Refactoring at a Time</title>
        <description>
          Apply one refactoring technique, test it, commit it, then move to the next.
          Don't combine multiple refactorings in a single change.
        </description>
      </rule>

      <rule id="4" priority="high">
        <title>Keep Code Compilable</title>
        <description>
          After every small step, the code should compile and run. Never leave the
          code in a broken state, even for "just a minute".
        </description>
      </rule>

      <rule id="5" priority="medium">
        <title>Refactor Don't Rewrite</title>
        <description>
          Prefer incremental refactoring over complete rewrites. Rewrites lose knowledge
          and introduce new bugs. Refactor toward better design gradually.
        </description>
      </rule>

      <rule id="6" priority="medium">
        <title>Separate Refactoring from New Features</title>
        <description>
          Don't add new features while refactoring. Don't fix bugs while refactoring.
          Each concern should be addressed separately for clear change tracking.
        </description>
      </rule>

      <rule id="7" priority="medium">
        <title>Commit Frequently</title>
        <description>
          After each successful refactoring, commit. Small commits with clear messages
          make it easy to revert if something goes wrong.
        </description>
      </rule>

      <rule id="8" priority="low">
        <title>Document the "Why" not the "What"</title>
        <description>
          Commit messages should explain why the refactoring was done, not just what changed.
          The diff shows what changed; the message explains the motivation.
        </description>
      </rule>
    </section>

    <section title="Code Review Guidelines">
      <p>
        When reviewing refactoring changes, focus on:
      </p>
      <guidelines>
        <guideline>Did behavior remain unchanged? (verify with tests)</guideline>
        <guideline>Is the code more readable after the change?</guideline>
        <guideline>Was the refactoring applied correctly?</guideline>
        <guideline>Are tests still passing?</guideline>
        <guideline>Was the change done in small, verifiable steps?</guideline>
      </guidelines>
    </section>

    <section title="Team Collaboration">
      <p>
        Refactoring is a team activity. Follow these practices:
      </p>
      <practices>
        <practice>Communicate refactoring goals with the team</practice>
        <practice>Review refactoring changes together</practice>
        <practice>Share refactoring techniques in code reviews</practice>
        <practice>Build team knowledge through pair refactoring</practice>
        <practice>Maintain refactoring checklists for common patterns</practice>
      </practices>
    </section>
  </rules>

  <workflow>
    <section title="Refactoring Workflow Phases">
      <phase id="1" name="Identification">
        <steps>
          <step>Identify code smells or areas needing improvement</step>
          <step>Prioritize refactoring based on impact and risk</step>
          <step>Document the current state and problems</step>
        </steps>
        <output>List of refactoring candidates with priority scores</output>
      </phase>

      <phase id="2" name="Preparation">
        <steps>
          <step>Ensure test coverage exists</step>
          <step>Run tests to establish baseline</step>
          <step>Create feature branch for refactoring</step>
          <step>Document refactoring goals</step>
        </steps>
        <output>Code with test coverage, feature branch ready</output>
      </phase>

      <phase id="3" name="Refactoring">
        <steps>
          <step>Choose appropriate refactoring technique</step>
          <step>Apply refactoring in small steps</step>
          <step>Test after each step</step>
          <step>Commit successful changes</step>
          <step>Repeat until goal is achieved</step>
        </steps>
        <output>Refactored code with passing tests</output>
      </phase>

      <phase id="4" name="Verification">
        <steps>
          <step>Run full test suite</step>
          <step>Run integration tests</step>
          <step>Perform manual testing if applicable</step>
          <step>Compare performance metrics if relevant</step>
          <step>Review diff to ensure no unintended changes</step>
        </steps>
        <output>Verified refactoring with test results</output>
      </phase>

      <phase id="5" name="Documentation">
        <steps>
          <step>Update code comments if needed</step>
          <step>Update relevant documentation</step>
          <step>Create pull request with detailed description</step>
          <step>Share lessons learned with team</step>
        </steps>
        <output>Documented changes, pull request ready</output>
      </phase>
    </section>

    <section title="Workflow Decision Tree">
      <decision_point>
        <question>Does the code have tests?</question>
        <if_yes>Proceed with refactoring</if_yes>
        <if_no>Write tests first, then refactor</if_no>
      </decision_point>

      <decision_point>
        <question>Is the refactoring large or complex?</question>
        <if_yes>Break into smaller refactoring steps</if_yes>
        <if_no>Proceed with single refactoring</if_no>
      </decision_point>

      <decision_point>
        <question>Did tests fail after refactoring?</question>
        <if_yes>Rollback immediately, investigate, try again</if_yes>
        <if_no>Commit changes and continue</if_no>
      </decision_point>

      <decision_point>
        <question>Is code behavior unclear?</question>
        <if_yes>Refactor to improve clarity before adding features</if_yes>
        <if_no>Proceed with planned work</if_no>
      </decision_point>
    </section>
  </workflow>

  <best_practices>
    <section title="SOLID Principles">
      <principle id="1" name="Single Responsibility Principle (SRP)">
        <description>A class should have one, and only one, reason to change.</description>
        <example>
          Bad: A User class that handles authentication, database operations, and email notifications.
          Good: Separate classes for User, UserRepository, AuthService, and EmailNotifier.
        </example>
        <refactoring_techniques>
          <technique>Extract Class</technique>
          <technique>Extract Interface</technique>
          <technique>Decompose Conditional</technique>
        </refactoring_techniques>
      </principle>

      <principle id="2" name="Open/Closed Principle (OCP)">
        <description>Software entities should be open for extension but closed for modification.</description>
        <example>
          Bad: Adding new payment type requires modifying PaymentProcessor class.
          Good: PaymentProcessor uses strategy pattern, new types added via implementation.
        </example>
        <refactoring_techniques>
          <technique>Extract Strategy</technique>
          <technique>Replace Conditional with Polymorphism</technique>
          <technique>Extract Template Method</technique>
        </refactoring_techniques>
      </principle>

      <principle id="3" name="Liskov Substitution Principle (LSP)">
        <description>Subtypes must be substitutable for their base types.</description>
        <example>
          Bad: Rectangle subclass Square that modifies width/height behavior.
          Good: Separate Shape interface with Rectangle and Square implementations.
        </example>
        <refactoring_techniques>
          <technique>Extract Superclass</technique>
          <technique>Extract Interface</technique>
          <technique>Replace Inheritance with Delegation</technique>
        </refactoring_techniques>
      </principle>

      <principle id="4" name="Interface Segregation Principle (ISP)">
        <description>Clients should not be forced to depend on interfaces they don't use.</description>
        <example>
          Bad: A Worker interface with work(), eat(), and sleep() methods.
          Good: Separate interfaces for Workable, Eatable, and Sleepable behaviors.
        </example>
        <refactoring_techniques>
          <technique>Extract Interface</technique>
          <technique>Split Interface</technique>
          <technique>Separate Domain from Presentation</technique>
        </refactoring_techniques>
      </principle>

      <principle id="5" name="Dependency Inversion Principle (DIP)">
        <description>Depend on abstractions, not concretions.</description>
        <example>
          Bad: OrderProcessor directly depends on MySQLDatabase, StripePaymentGateway.
          Good: OrderProcessor depends on Database, PaymentGateway interfaces.
        </example>
        <refactoring_techniques>
          <technique>Extract Interface</technique>
          <technique>Parameterize Method</technique>
          <technique>Introduce Parameter Object</technique>
        </refactoring_techniques>
      </principle>
    </section>

    <section title="Composition Over Inheritance">
      <description>
        Favor composition (has-a relationship) over inheritance (is-a relationship) for
        code reuse and flexibility. Inheritance creates tight coupling, composition is looser.
      </description>
      <when_to_use>
        <scenario>Use inheritance when: Subclass truly is a type of parent, types share core identity</scenario>
        <scenario>Use composition when: Want behavior reuse, need runtime flexibility, types don't share identity</scenario>
      </when_to_use>
      <refactoring_technique>Replace Inheritance with Delegation</refactoring_technique>
    </section>

    <section title="Naming Conventions">
      <description>
        Good names make code self-documenting. Names should reveal intent.
      </description>
      <guidelines>
        <guideline>Use intention-revealing names (e.g., daysSinceModification not d)</guideline>
        <guideline>Avoid disinformation (e.g., accountList if it's not actually a List)</guideline>
        <guideline>Make meaningful distinctions (e.g., Customer vs CustomerInfo not redundant)</guideline>
        <guideline>Use pronounceable names (e.g., generationTimestamp not genTs)</guideline>
        <guideline>Use searchable names (e.g., MAX_CLASSES_PER_STUDENT not 7)</guideline>
      </guidelines>
      <refactoring_techniques>
        <technique>Rename Method</technique>
        <technique>Rename Variable</technique>
        <technique>Rename Class</technique>
      </refactoring_techniques>
    </section>

    <section title="Function Design">
      <description>
        Functions should be small, do one thing, and do it well.
      </description>
      <guidelines>
        <guideline>Functions should be small (ideally < 20 lines)</guideline>
        <guideline>Functions should do one thing (one level of abstraction)</guideline>
        <guideline>Functions should have descriptive names</guideline>
        <guideline>Functions should have minimal arguments (ideally 0-2, max 3-4)</guideline>
        <guideline>Avoid side effects or make them explicit in the name</guideline>
        <guideline>Use exceptions for error handling, not return codes</guideline>
      </guidelines>
    </section>

    <section title="DRY (Don't Repeat Yourself)">
      <description>
        Every piece of knowledge must have a single, unambiguous, authoritative representation
        within a system. Duplication leads to maintenance problems and bugs.
      </description>
      <types_of_duplication>
        <type>Accidental duplication: Code that looks similar but represents different concepts</type>
        <type>Essential duplication: Code that represents the same concept in different places</type>
      </types_of_duplication>
      <note>
        Only refactor essential duplication. Accidental duplication should be kept separate
        to avoid false coupling.
      </note>
      <refactoring_techniques>
        <technique>Extract Method</technique>
        <technique>Extract Class</technique>
        <technique>Form Template Method</technique>
        <technique>Replace Magic Number with Constant</technique>
      </refactoring_techniques>
    </section>

    <section title="KISS (Keep It Simple, Stupid)">
      <description>
        Complexity should be avoided whenever possible. Simple code is easier to understand,
        maintain, and debug. Optimize for readability first.
      </description>
      <guidelines>
        <guideline>Avoid clever code that requires deep thought to understand</guideline>
        <guideline>Prefers clear and verbose over concise and cryptic</guideline>
        <guideline>Choose the simplest solution that meets requirements</guideline>
        <guideline>Reduce nesting through early returns</guideline>
        <guideline>Use guard clauses to reduce cognitive load</guideline>
      </guidelines>
    </section>

    <section title="YAGNI (You Aren't Gonna Need It)">
      <description>
        Don't build functionality or abstractions until they're actually needed. Premature
        abstraction is waste. Build what you need now, refactor when requirements change.
      </description>
      <application>
        <scenario>Don't: "I'll add this parameter in case we need it later"</scenario>
        <scenario>Don't: "Let's create an interface for this single implementation"</scenario>
        <scenario>Do: "I'll refactor when we actually have two implementations"</scenario>
        <scenario>Do: "I'll add that feature when a user requests it"</scenario>
      </application>
    </section>
  </best_practices>

  <anti_patterns>
    <section title="Common Refactoring Anti-Patterns">
      <anti_pattern id="1" severity="critical">
        <name>The Big Rewrite</name>
        <description>
          Instead of incremental refactoring, attempting to rewrite large sections of code
          at once. This is risky, loses knowledge, and introduces bugs.
        </description>
        <consequence>High risk of bugs, lost knowledge, delayed delivery</consequence>
        <alternative>Refactor incrementally in small, tested steps</alternative>
      </anti_pattern>

      <anti_pattern id="2" severity="critical">
        <name>Refactoring Without Tests</name>
        <description>
          Changing code structure without test coverage. This isn't refactoring, it's
          just changing code, and will introduce bugs.
        </description>
        <consequence>Bugs introduced, behavior changes, broken functionality</consequence>
        <alternative>Write tests first, then refactor</alternative>
      </anti_pattern>

      <anti_pattern id="3" severity="high">
        <name>Premature Optimization</name>
        <description>
          Refactoring for performance before measuring and identifying actual bottlenecks.
          Most optimizations are premature and reduce clarity.
        </description>
        <consequence>Complex code without meaningful performance gain</consequence>
        <alternative>Measure first, optimize only proven bottlenecks</alternative>
      </anti_pattern>

      <anti_pattern id="4" severity="high">
        <name>YAGNI Violation</name>
        <description>
          Adding abstractions or features "in case they're needed later". This adds complexity
          without solving actual problems.
        </description>
        <consequence>Unnecessary complexity, harder to understand and maintain</consequence>
        <alternative>Build only what's needed now, refactor later when needed</alternative>
      </anti_pattern>

      <anti_pattern id="5" severity="medium">
        <name>Shotgun Surgery</name>
        <description>
          Making one change requires touching many files. This indicates poor design and
          high coupling.
        </description>
        <consequence>Difficult maintenance, error-prone changes</consequence>
        <alternative>
          Refactor to consolidate related code, use appropriate design patterns
        </alternative>
      </anti_pattern>

      <anti_pattern id="6" severity="medium">
        <name>Feature Envy</name>
        <description>
          A method that seems more interested in a class other than the one it's in.
          It accesses more data from other objects than its own.
        </description>
        <consequence>Poor encapsulation, high coupling, hard to reuse</consequence>
        <alternative>Move the method to the class it's envious of</alternative>
      </anti_pattern>

      <anti_pattern id="7" severity="medium">
        <name>Primitive Obsession</name>
        <description>
          Using primitive types (int, string) instead of small objects for concepts like
          money, dates, ranges, phone numbers, etc.
        </description>
        <consequence>Lost type safety, scattered validation logic</consequence>
        <alternative>Replace primitives with value objects</alternative>
      </anti_pattern>

      <anti_pattern id="8" severity="low">
        <name>Over-Engineering</name>
        <description>
          Applying complex patterns and abstractions to simple problems. More complexity
          than the problem warrants.
        </description>
        <consequence>Hard to understand, maintain, and extend</consequence>
        <alternative>Use the simplest solution that meets requirements</alternative>
      </anti_pattern>
    </section>

    <section title="Code Smells">
      <smell_category name="Bloaters">
        <smell>Long Method</smell>
        <smell>Large Class</smell>
        <smell>Primitive Obsession</smell>
        <smell>Long Parameter List</smell>
        <smell>Data Clumps</smell>
      </smell_category>

      <smell_category name="Object-Orientation Abusers">
        <smell>Switch Statements</smell>
        <smell>Temporary Fields</smell>
        <smell>Refused Bequest</smell>
        <smell>Alternative Classes with Different Interfaces</smell>
      </smell_category>

      <smell_category name="Change Preventers">
        <smell>Divergent Change</smell>
        <smell>Shotgun Surgery</smell>
        <smell>Parallel Inheritance Hierarchies</smell>
      </smell_category>

      <smell_category name="Dispensables">
        <smell>Comments</smell>
        <smell>Duplicate Code</smell>
        <smell>Lazy Class</smell>
        <smell>Data Class</smell>
        <smell>Dead Code</smell>
        <smell>Speculative Generality</smell>
      </smell_category>

      <smell_category name="Couplers">
        <smell>Feature Envy</smell>
        <smell>Inappropriate Intimacy</smell>
        <smell>Message Chains</smell>
        <smell>Middle Man</smell>
      </smell_category>
    </section>
  </anti_patterns>

  <examples>
    <section title="Example 1: Extract Method">
      <description>
        Breaking down a long method into smaller, named methods that reveal intent.
      </description>
      <before>
        <code language="typescript">
          function calculateOrderTotal(order: Order): number {
            let total = 0;
            for (const item of order.items) {
              const basePrice = item.price * item.quantity;
              let discount = 0;
              if (item.quantity > 10) {
                discount = basePrice * 0.1;
              } else if (item.quantity > 5) {
                discount = basePrice * 0.05;
              }
              const taxRate = order.customer.isTaxExempt ? 0 : 0.08;
              const tax = (basePrice - discount) * taxRate;
              total += basePrice - discount + tax;
            }
            if (order.shippingMethod === 'express' && total > 100) {
              total += 0; // Free express shipping
            } else if (order.shippingMethod === 'express') {
              total += 15.99;
            } else {
              total += 5.99;
            }
            return total;
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          function calculateOrderTotal(order: Order): number {
            const itemsTotal = calculateItemsTotal(order);
            const shipping = calculateShipping(order, itemsTotal);
            return itemsTotal + shipping;
          }

          function calculateItemsTotal(order: Order): number {
            return order.items.reduce((total, item) => {
              const itemTotal = calculateItemTotal(item, order.customer.isTaxExempt);
              return total + itemTotal;
            }, 0);
          }

          function calculateItemTotal(item: OrderItem, isTaxExempt: boolean): number {
            const basePrice = item.price * item.quantity;
            const discount = calculateDiscount(item.quantity, basePrice);
            const tax = calculateTax(basePrice - discount, isTaxExempt);
            return basePrice - discount + tax;
          }

          function calculateDiscount(quantity: number, basePrice: number): number {
            if (quantity > 10) return basePrice * 0.1;
            if (quantity > 5) return basePrice * 0.05;
            return 0;
          }

          function calculateTax(amount: number, isTaxExempt: boolean): number {
            return isTaxExempt ? 0 : amount * 0.08;
          }

          function calculateShipping(order: Order, itemsTotal: number): number {
            if (order.shippingMethod === 'express') {
              return itemsTotal > 100 ? 0 : 15.99;
            }
            return 5.99;
          }
        </code>
      </after>
      <benefits>
        <benefit>Each function has a single, clear responsibility</benefit>
        <benefit>Code is self-documenting through function names</benefit>
        <benefit>Easier to test individual components</benefit>
        <benefit>Can reuse discount and tax calculation logic</benefit>
      </benefits>
    </section>

    <section title="Example 2: Rename Variable">
      <description>
        Improving code clarity through intention-revealing names.
      </description>
      <before>
        <code language="typescript">
          function process(d: Date[], amt: number, curr: string): boolean {
            const now = new Date();
            const d2 = d.find(x => x > now);
            if (!d2) return false;
            const days = Math.floor((d2.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return days <= 30 && amt > 1000 && curr === 'USD';
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          function canProcessPayment(
            availableDates: Date[],
            amount: number,
            currency: string
          ): boolean {
            const today = new Date();
            const nextAvailableDate = availableDates.find(date => date > today);

            if (!nextAvailableDate) return false;

            const daysUntilAvailable = Math.floor(
              (nextAvailableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            const isWithinWindow = daysUntilAvailable <= 30;
            const meetsMinimum = amount > 1000;
            const isUSD = currency === 'USD';

            return isWithinWindow && meetsMinimum && isUSD;
          }
        </code>
      </after>
      <benefits>
        <benefit>Function name reveals intent (canProcessPayment)</benefit>
        <benefit>All variables have meaningful, intention-revealing names</benefit>
        <benefit>Intermediate boolean values make logic clear</benefit>
        <benefit>Code is self-documenting</benefit>
      </benefits>
    </section>

    <section title="Example 3: Extract Class">
      <description>
        Separating responsibilities into focused classes.
      </description>
      <before>
        <code language="typescript">
          class User {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            creditCardNumber: string;
            creditCardExpiry: string;
            creditCardCVV: string;

            constructor(data: any) {
              this.id = data.id;
              this.name = data.name;
              this.email = data.email;
              this.passwordHash = data.passwordHash;
              this.street = data.street;
              this.city = data.city;
              this.state = data.state;
              this.zipCode = data.zipCode;
              this.country = data.country;
              this.creditCardNumber = data.creditCardNumber;
              this.creditCardExpiry = data.creditCardExpiry;
              this.creditCardCVV = data.creditCardCVV;
            }

            validate(): boolean {
              return this.email.includes('@') &&
                     this.passwordHash.length > 0 &&
                     this.zipCode.length === 5;
            }

            getFullAddress(): string {
              return `${this.street}\n${this.city}, ${this.state} ${this.zipCode}\n${this.country}`;
            }

            getMaskedCreditCard(): string {
              return `****-****-****-${this.creditCardNumber.slice(-4)}`;
            }

            save(): void {
              // Save user to database
            }

            sendWelcomeEmail(): void {
              // Send welcome email
            }
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          class User {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            address: Address;
            paymentMethod: PaymentMethod;

            constructor(data: any) {
              this.id = data.id;
              this.name = data.name;
              this.email = data.email;
              this.passwordHash = data.passwordHash;
              this.address = new Address(data);
              this.paymentMethod = new PaymentMethod(data);
            }

            validate(): boolean {
              return this.email.includes('@') && this.passwordHash.length > 0;
            }

            save(): void {
              // Save user to database
            }

            sendWelcomeEmail(): void {
              // Send welcome email
            }
          }

          class Address {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;

            constructor(data: any) {
              this.street = data.street;
              this.city = data.city;
              this.state = data.state;
              this.zipCode = data.zipCode;
              this.country = data.country;
            }

            getFullAddress(): string {
              return `${this.street}\n${this.city}, ${this.state} ${this.zipCode}\n${this.country}`;
            }

            isValid(): boolean {
              return this.zipCode.length === 5;
            }
          }

          class PaymentMethod {
            creditCardNumber: string;
            creditCardExpiry: string;
            creditCardCVV: string;

            constructor(data: any) {
              this.creditCardNumber = data.creditCardNumber;
              this.creditCardExpiry = data.creditCardExpiry;
              this.creditCardCVV = data.creditCardCVV;
            }

            getMaskedNumber(): string {
              return `****-****-****-${this.creditCardNumber.slice(-4)}`;
            }

            isValid(): boolean {
              const now = new Date();
              const expiry = new Date(this.creditCardExpiry);
              return expiry > now;
            }
          }
        </code>
      </after>
      <benefits>
        <benefit>Each class has a single responsibility</benefit>
        <benefit>Address can be reused across different entities</benefit>
        <benefit>PaymentMethod can support multiple payment types</benefit>
        <benefit>Easier to test individual components</benefit>
        <benefit>Better encapsulation of validation logic</benefit>
      </benefits>
    </section>

    <section title="Example 4: Decompose Conditional">
      <description>
        Simplifying complex conditional logic through extraction.
      </description>
      <before>
        <code language="typescript">
          function calculateShippingCost(order: Order): number {
            if (order.weight > 50 && order.destinationCountry === 'US' && order.shippingMethod === 'ground' && !order.isHazardous && order.totalValue > 1000 && order.customer.tier === 'premium') {
              return 0;
            } else if (order.weight > 50 && order.destinationCountry === 'US' && order.shippingMethod === 'ground' && !order.isHazardous && order.totalValue <= 1000) {
              return 25.99;
            } else if (order.weight > 50 && order.destinationCountry === 'US' && order.shippingMethod === 'ground' && order.isHazardous) {
              return 45.99;
            } else if (order.weight > 50 && order.destinationCountry === 'US' && order.shippingMethod === 'express') {
              return 65.99;
            } else if (order.weight <= 50 && order.destinationCountry === 'US' && order.shippingMethod === 'ground') {
              return 9.99;
            } else if (order.destinationCountry !== 'US') {
              return order.weight * 2.5;
            } else {
              return 19.99;
            }
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          function calculateShippingCost(order: Order): number {
            if (qualifiesForFreeShipping(order)) {
              return 0;
            }

            if (order.isInternational) {
              return calculateInternationalShipping(order);
            }

            return calculateDomesticShipping(order);
          }

          function qualifiesForFreeShipping(order: Order): boolean {
            return isHeavyWeight(order) &&
                   isDomesticGroundShipping(order) &&
                   !order.isHazardous &&
                   isPremiumCustomer(order) &&
                   hasHighOrderValue(order);
          }

          function calculateDomesticShipping(order: Order): number {
            if (isHeavyWeight(order)) {
              return calculateHeavyDomesticShipping(order);
            }
            return calculateLightDomesticShipping(order);
          }

          function calculateHeavyDomesticShipping(order: Order): number {
            if (order.shippingMethod === 'express') {
              return 65.99;
            }
            if (order.isHazardous) {
              return 45.99;
            }
            return 25.99;
          }

          function calculateLightDomesticShipping(order: Order): number {
            return 9.99;
          }

          function calculateInternationalShipping(order: Order): number {
            return order.weight * 2.5;
          }

          // Helper predicates
          function isHeavyWeight(order: Order): boolean {
            return order.weight > 50;
          }

          function isDomesticGroundShipping(order: Order): boolean {
            return order.destinationCountry === 'US' && order.shippingMethod === 'ground';
          }

          function isPremiumCustomer(order: Order): boolean {
            return order.customer.tier === 'premium';
          }

          function hasHighOrderValue(order: Order): boolean {
            return order.totalValue > 1000;
          }
        </code>
      </after>
      <benefits>
        <benefit>Complex conditions broken down into named, testable functions</benefit>
        <benefit>Main function reads like business requirements</benefit>
        <benefit>Easy to modify individual rules without affecting others</benefit>
        <benefit>Can unit test each condition independently</benefit>
      </benefits>
    </section>

    <section title="Example 5: Replace Conditional with Polymorphism">
      <description>
        Using polymorphism to eliminate complex switch statements.
      </description>
      <before>
        <code language="typescript">
          type EmployeeType = 'full-time' | 'part-time' | 'contractor';

          interface Employee {
            type: EmployeeType;
            monthlySalary?: number;
            hourlyRate?: number;
            hoursWorked?: number;
            contractAmount?: number;
          }

          function calculatePay(employee: Employee): number {
            switch (employee.type) {
              case 'full-time':
                return employee.monthlySalary || 0;
              case 'part-time':
                return (employee.hourlyRate || 0) * (employee.hoursWorked || 0);
              case 'contractor':
                return employee.contractAmount || 0;
              default:
                throw new Error(`Unknown employee type: ${employee.type}`);
            }
          }

          function calculateBenefits(employee: Employee): number {
            switch (employee.type) {
              case 'full-time':
                return 500; // Full benefits
              case 'part-time':
                return 200; // Partial benefits
              case 'contractor':
                return 0; // No benefits
              default:
                throw new Error(`Unknown employee type: ${employee.type}`);
            }
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          abstract class Employee {
            abstract calculatePay(): number;
            abstract calculateBenefits(): number;
          }

          class FullTimeEmployee extends Employee {
            constructor(private monthlySalary: number) {
              super();
            }

            calculatePay(): number {
              return this.monthlySalary;
            }

            calculateBenefits(): number {
              return 500; // Full benefits
            }
          }

          class PartTimeEmployee extends Employee {
            constructor(
              private hourlyRate: number,
              private hoursWorked: number
            ) {
              super();
            }

            calculatePay(): number {
              return this.hourlyRate * this.hoursWorked;
            }

            calculateBenefits(): number {
              return 200; // Partial benefits
            }
          }

          class ContractorEmployee extends Employee {
            constructor(private contractAmount: number) {
              super();
            }

            calculatePay(): number {
              return this.contractAmount;
            }

            calculateBenefits(): number {
              return 0; // No benefits
            }
          }

          // Usage
          const employees: Employee[] = [
            new FullTimeEmployee(5000),
            new PartTimeEmployee(20, 80),
            new ContractorEmployee(3000)
          ];

          const totalPay = employees.reduce((sum, emp) => sum + emp.calculatePay(), 0);
        </code>
      </after>
      <benefits>
        <benefit>Eliminates switch statements, easier to extend</benefit>
        <benefit>New employee types added by creating new class, not modifying existing code</benefit>
        <benefit>Each employee type encapsulates its own logic</benefit>
        <benefit>Follows Open/Closed Principle</benefit>
        <benefit>Compiler ensures all methods are implemented</benefit>
      </benefits>
    </section>

    <section title="Example 6: Extract Interface">
      <description>
        Separating interface from implementation for flexibility.
      </description>
      <before>
        <code language="typescript">
          class MySQLDatabase {
            connect(connection_string: string): void {
              // MySQL-specific connection logic
            }

            query(sql: string): any[] {
              // MySQL-specific query logic
              return [];
            }

            close(): void {
              // MySQL-specific close logic
            }
          }

          class UserService {
            private db: MySQLDatabase;

            constructor(db: MySQLDatabase) {
              this.db = db;
            }

            getUser(id: string): any {
              return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
            }
          }

          // Hard to test because requires actual MySQL database
          // Hard to switch to PostgreSQL without changing UserService
        </code>
      </before>
      <after>
        <code language="typescript">
          interface Database {
            connect(connection_string: string): void;
            query(sql: string): any[];
            close(): void;
          }

          class MySQLDatabase implements Database {
            connect(connection_string: string): void {
              // MySQL-specific connection logic
            }

            query(sql: string): any[] {
              // MySQL-specific query logic
              return [];
            }

            close(): void {
              // MySQL-specific close logic
            }
          }

          class PostgreSQLDatabase implements Database {
            connect(connection_string: string): void {
              // PostgreSQL-specific connection logic
            }

            query(sql: string): any[] {
              // PostgreSQL-specific query logic
              return [];
            }

            close(): void {
              // PostgreSQL-specific close logic
            }
          }

          class MockDatabase implements Database {
            private data: any[] = [];

            connect(connection_string: string): void {
              // Mock connection logic
            }

            query(sql: string): any[] {
              // Return mock data
              return this.data;
            }

            close(): void {
              // Mock close logic
            }

            setMockData(data: any[]) {
              this.data = data;
            }
          }

          class UserService {
            private db: Database;

            constructor(db: Database) {
              this.db = db;
            }

            getUser(id: string): any {
              return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
            }
          }

          // Easy to test with MockDatabase
          // Easy to switch database implementations
        </code>
      </after>
      <benefits>
        <benefit>UserService is decoupled from specific database implementation</benefit>
        <benefit>Easy to test with mock implementations</benefit>
        <benefit>Easy to switch databases without changing UserService</benefit>
        <benefit>Follows Dependency Inversion Principle</benefit>
      </benefits>
    </section>

    <section title="Example 7: Replace Magic Number with Constant">
      <description>
        Making code more readable and maintainable by replacing magic numbers.
      </description>
      <before>
        <code language="typescript">
          function calculateTax(amount: number): number {
            return amount * 0.08;
          }

          function isWeekend(date: Date): boolean {
            const day = date.getDay();
            return day === 0 || day === 6;
          }

          function formatPhoneNumber(phone: string): string {
            if (phone.length === 10) {
              return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
            }
            return phone;
          }

          function calculateShipping(weight: number): number {
            if (weight > 50) {
              return 25.99;
            }
            return 9.99;
          }
        </code>
      </before>
      <after>
        <code language="typescript">
          const SALES_TAX_RATE = 0.08;
          const SUNDAY = 0;
          const SATURDAY = 6;
          const US_PHONE_NUMBER_LENGTH = 10;
          const PHONE_AREA_CODE_LENGTH = 3;
          const PHONE_PREFIX_LENGTH = 3;
          const HEAVY_WEIGHT_THRESHOLD = 50;
          const HEAVY_SHIPPING_COST = 25.99;
          const STANDARD_SHIPPING_COST = 9.99;

          function calculateTax(amount: number): number {
            return amount * SALES_TAX_RATE;
          }

          function isWeekend(date: Date): boolean {
            const day = date.getDay();
            return day === SUNDAY || day === SATURDAY;
          }

          function formatPhoneNumber(phone: string): string {
            if (phone.length === US_PHONE_NUMBER_LENGTH) {
              return `(${phone.slice(0, PHONE_AREA_CODE_LENGTH)}) ${phone.slice(PHONE_AREA_CODE_LENGTH, PHONE_AREA_CODE_LENGTH + PHONE_PREFIX_LENGTH)}-${phone.slice(PHONE_AREA_CODE_LENGTH + PHONE_PREFIX_LENGTH)}`;
            }
            return phone;
          }

          function calculateShipping(weight: number): number {
            if (weight > HEAVY_WEIGHT_THRESHOLD) {
              return HEAVY_SHIPPING_COST;
            }
            return STANDARD_SHIPPING_COST;
          }
        </code>
      </after>
      <benefits>
        <benefit>Code becomes self-documenting</benefit>
        <benefit>Easy to change values in one place</benefit>
        <benefit>Makes business rules explicit</benefit>
        <benefit>Prevents errors from typos in magic numbers</benefit>
      </benefits>
    </section>

    <section title="Example 8: Introduce Parameter Object">
      <description>
        Reducing long parameter lists by grouping related parameters.
      </description>
      <before>
        <code language="typescript">
          function createOrder(
            customerId: string,
            customerName: string,
            customerEmail: string,
            street: string,
            city: string,
            state: string,
            zipCode: string,
            productId: string,
            quantity: number,
            price: number
          ): Order {
            // Create order logic
            return {} as Order;
          }

          // Calling the function
          const order = createOrder(
            '123',
            'John Doe',
            'john@example.com',
            '123 Main St',
            'Springfield',
            'IL',
            '62701',
            'PROD-456',
            2,
            29.99
          );
        </code>
      </before>
      <after>
        <code language="typescript">
          interface Customer {
            id: string;
            name: string;
            email: string;
          }

          interface Address {
            street: string;
            city: string;
            state: string;
            zipCode: string;
          }

          interface OrderItem {
            productId: string;
            quantity: number;
            price: number;
          }

          interface OrderDetails {
            customer: Customer;
            shippingAddress: Address;
            item: OrderItem;
          }

          function createOrder(details: OrderDetails): Order {
            // Create order logic
            return {} as Order;
          }

          // Calling the function
          const order = createOrder({
            customer: {
              id: '123',
              name: 'John Doe',
              email: 'john@example.com'
            },
            shippingAddress: {
              street: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62701'
            },
            item: {
              productId: 'PROD-456',
              quantity: 2,
              price: 29.99
            }
          });
        </code>
      </after>
      <benefits>
        <benefit>Reduced parameter count from 10 to 1</benefit>
        <benefit>Related data grouped logically</benefit>
        <benefit>Easy to add new fields without changing function signature</benefit>
        <benefit>More readable function calls</benefit>
        <benefit>Type safety on parameter groups</benefit>
      </benefits>
    </section>
  </examples>

  <integration_notes>
    <section title="Using with IDE Refactoring Tools">
      <subsection title="VS Code / WebStorm / IntelliJ">
        <p>
          Modern IDEs provide powerful refactoring tools. Use them when appropriate:
        </p>
        <built_in_refactorings>
          <tool>
            <name>Rename Symbol</name>
            <shortcut>F2 (VS Code), Shift+F6 (IntelliJ)</shortcut>
            <description>Rename variables, functions, classes across entire codebase</description>
          </tool>
          <tool>
            <name>Extract Method</name>
            <shortcut>Ctrl+Alt+M (IntelliJ), Cmd+Option+M (VS Code with extension)</shortcut>
            <description>Extract selected code into a new method</description>
          </tool>
          <tool>
            <name>Extract Variable</name>
            <shortcut>Ctrl+Alt+V (IntelliJ), Cmd+Option+V (VS Code with extension)</shortcut>
            <description>Extract expression into a named variable</description>
          </tool>
          <tool>
            <name>Inline Variable/Method</name>
            <shortcut>Ctrl+Alt+N (IntelliJ)</shortcut>
            <description>Replace variable/method usage with its definition</description>
          </tool>
          <tool>
            <name>Move File</name>
            <description>Move file to different directory, updating all imports</description>
          </tool>
          <tool>
            <name>Extract Interface</name>
            <description>Create interface from class methods</description>
          </tool>
        </built_in_refactorings>
        <warning>
          IDE refactorings are powerful but can make sweeping changes. Always:
          <ul>
            <li>Commit before using IDE refactoring tools</li>
            <li>Review the diff carefully after refactoring</li>
            <li>Run tests to ensure behavior is preserved</li>
          </ul>
        </warning>
      </subsection>

      <subsection title="AI-Assisted Refactoring">
        <p>
          AI tools can suggest refactoring but require careful oversight:
        </p>
        <guidelines>
          <guideline>Always review AI suggestions before applying</guideline <guideline>Run tests after each AI-suggested refactoring</guideline>
          <guideline>AI may not understand all context, use judgment</guideline>
          <guideline>AI can be good at identifying code smells</guideline>
          <guideline>Never apply bulk AI refactorings without review</guideline>
        </guidelines>
      </subsection>
    </section>

    <section title="Integration with Development Workflow">
      <subsection title="Before Committing">
        <checklist>
          <item>Code has been refactored for clarity</item>
          <item>No obvious code smells remain</item>
          <item>Tests still pass after refactoring</item>
          <item>Refactoring is in separate commit from features/fixes</item>
        </checklist>
      </subsection>

      <subsection title="Code Reviews">
        <p>
          Use code reviews to identify refactoring opportunities:
        </p>
        <review_questions>
          <question>Is this code clear and easy to understand?</question>
          <question>Are there duplicated code patterns?</question>
          <question>Would a different structure make this clearer?</question>
          <question>Are names intention-revealing?</question>
          <question>Is there a simpler way to achieve this?</question>
        </review_questions>
      </subsection>

      <subsection title="Technical Debt Tracking">
        <p>
          Track refactoring needs in your issue tracker:
        </p>
        <example_issue>
          Title: Refactor UserService to extract validation logic

          The UserService class has grown to 800 lines with mixed concerns.
          Validation logic is scattered throughout multiple methods.

          Refactoring goals:
          - Extract validation into separate Validator classes
          - Improve testability of validation rules
          - Make validation rules reusable across services

          Effort: 4 hours
          Priority: Medium
          Linked to: Feature #123 (User registration improvements)
        </example_issue>
      </subsection>
    </section>
  </integration_notes>

  <error_handling>
    <section title="Common Refactoring Errors">
      <error type="breaking_change">
        <description>Refactoring that changes public API behavior</description>
        <prevention>
          <step>Identify all consumers of the code before refactoring</step>
          <step>Check for public API usage across codebase</step>
          <step>Consider deprecation process for public APIs</step>
          <step>Run integration tests to catch breaking changes</step>
        </prevention>
        <recovery>
          If you accidentally break behavior:
          <ul>
            <li>Immediately revert the refactoring commit</li>
            <li>Identify what behavior changed</li>
            <li>Either adjust approach or update dependent code</li>
            <li>Re-apply refactoring with fixes</li>
          </ul>
        </recovery>
      </error>

      <error type="test_failure">
        <description>Tests fail after refactoring</description>
        <diagnosis>
          <scenario>Test was flaky, refactoring exposed the flakiness</scenario>
          <scenario>Refactoring changed behavior (not true refactoring)</scenario>
          <scenario>Test was testing implementation, not behavior</scenario>
          <scenario>Refactoring broke something subtle</scenario>
        </diagnosis>
        <recovery>
          <step>Review the test failure - is it a legitimate behavior change?</step>
          <step>If behavior changed, revert and refactor again more carefully</step>
          <step>If test was testing implementation, update the test</step>
          <step>If test was flaky, fix the test first, then refactor</step>
        </recovery>
      </error>

      <error type="merge_conflict">
        <description>Refactoring branch has merge conflicts</description>
        <prevention>
          <step>Keep refactoring branches small and short-lived</step>
          <step>Communicate refactoring plans to team</step>
          <step>Refactor in areas with less active development if possible</step>
        </prevention>
        <resolution>
          <step>Understand what changed in both branches</step>
          <step>Coordinate with other developers if needed</step>
          <step>Resolve conflicts carefully, maintaining behavior</step>
          <step>Run full test suite after resolution</step>
        </resolution>
      </error>

      <error type="performance_regression">
        <description>Refactoring accidentally reduces performance</description>
        <prevention>
          <step>Have performance tests for critical paths</step>
          <step>Profile before and after if performance is critical</step>
          <step>Be careful with changes in loops and hot paths</step>
        </prevention>
        <recovery>
          <step>Measure to confirm performance regression</step>
          <step>Identify the specific change causing regression</step>
          <step>Either revert that specific change or optimize</step>
          <step>Consider if performance tradeoff is worth clarity gain</step>
        </recovery>
      </error>
    </section>

    <section title="Rollback Strategies">
      <strategy name="Git Revert">
        <description>Use `git revert` to undo a refactoring commit while preserving history</description>
        <command>git revert <commit-hash></command>
        <use_when>Refactoring was already pushed and shared</use_when>
      </strategy>

      <strategy name="Git Reset">
        <description>Use `git reset` to remove commits that haven't been shared</description>
        <command>git reset --hard HEAD~1</command>
        <use_when>Refactoring was only in local branch</use_when>
      </strategy>

      <strategy name="Manual Rollback">
        <description>Manually revert changes for more control</description>
        <use_when>Need to keep some parts of the refactoring</use_when>
      </strategy>

      <strategy name="Feature Branch Abandonment">
        <description>Delete the refactoring branch and start fresh</description>
        <use_when>Refactoring went completely off the rails</use_when>
      </strategy>
    </section>

    <section title="When to Abort Refactoring">
      <p>
        It's okay to stop mid-refactoring if you discover complications. Know when to cut losses.
      </p>
      <abort_criteria>
        <criterion>Refactoring is much more complex than anticipated</criterion>
        <criterion>Code is more coupled than initially apparent</criterion>
        <criterion>Tests reveal hidden dependencies and edge cases</criterion>
        <criterion>Business priorities change, making refactoring less important</criterion>
        <criterion>You discover the code is about to be replaced anyway</criterion>
      </abort_criteria>
      <steps_to_abort>
        <step>Commit what you have (even if incomplete)</step>
        <step>Document what you learned and why you're stopping</step>
        <step>Create issue tracking refactoring debt for later</step>
        <step>Communicate with team about abandoned refactoring</step>
      </steps_to_abort>
    </section>
  </error_handling>

  <output_format>
    <section title="Code Diff Format">
      <p>
        When presenting refactoring changes, use unified diff format with clear before/after:
      </p>
      <example>
        <title>Example Refactoring Output</title>
        <content>
          ```diff
          refactor(auth): extract password validation logic

          Before:
          - Password validation mixed with authentication logic
          - Difficult to test validation rules independently
          - Cannot reuse validation in other contexts

          After:
          + Extracted validatePassword() function
          + Separated validation concerns from authentication
          + Made validation rules reusable and testable

          Changes:
          --------

          function authenticate(username: string, password: string): boolean {
          -  if (password.length < 8) return false;
          -  if (!/[A-Z]/.test(password)) return false;
          -  if (!/[a-z]/.test(password)) return false;
          -  if (!/[0-9]/.test(password)) return false;
          +  if (!validatePassword(password)) return false;
          +
             return database.verifyCredentials(username, password);
          }

          +function validatePassword(password: string): boolean {
          +  const MIN_LENGTH = 8;
          +  const HAS_UPPERCASE = /[A-Z]/;
          +  const HAS_LOWERCASE = /[a-z]/;
          +  const HAS_NUMBER = /[0-9]/;
          +
          +  return password.length >= MIN_LENGTH &&
          +         HAS_UPPERCASE.test(password) &&
          +         HAS_LOWERCASE.test(password) &&
          +         HAS_NUMBER.test(password);
          +}

          Test Results:
          ✓ All existing tests pass
          ✓ New validation tests added and passing
          ✓ No behavior changes detected

          Benefits:
          - Validation logic is now testable in isolation
          - Rules can be reused in registration flow
          - Easy to add new validation requirements
          ```
        </content>
      </example>
    </section>

    <section title="Refactoring Summary Template">
      <template>
        <title>Refactoring: [Brief Title]</title>

        <section>Motivation</section>
        <p>Why this refactoring was necessary</p>

        <section>Changes</section>
        <ul>
          <li>Specific change 1</li>
          <li>Specific change 2</li>
          <li>Specific change 3</li>
        </ul>

        <section>Benefits</section>
        <ul>
          <li>Benefit 1</li>
          <li>Benefit 2</li>
        </ul>

        <section>Testing</section>
        <ul>
          <li>Tests added: X</li>
          <li>Tests passing: Y/Y</li>
          <li>Coverage: Z%</li>
        </ul>

        <section>Migration Notes</section>
        <p>Any special considerations for upgrading</p>
      </template>
    </section>
  </output_format>

  <related_skills>
    <skill name="systematic-debugging">
      <relationship>
        Refactoring often reveals bugs that were hidden in complex code. Systematic debugging
        skills help identify and fix these issues when they're exposed.
      </relationship>
    </skill>

    <skill name="test-driven-development">
      <relationship>
        TDD provides the safety net that makes refactoring safe. Tests confirm that behavior
        is preserved throughout the refactoring process.
      </relationship>
    </skill>

    <skill name="code-review">
      <relationship>
        Code reviews are ideal places to identify refactoring opportunities and verify that
        refactoring was done correctly without changing behavior.
      </relationship>
    </skill>

    <skill name="clean-code">
      <relationship>
        Clean code principles guide refactoring decisions. Refactoring is the practical
        application of clean code principles to existing code.
      </relationship>
    </skill>

    <skill name="design-patterns">
      <relationship>
        Many refactorings move code toward established design patterns. Understanding patterns
        helps identify the target structure for refactoring.
      </relationship>
    </skill>
  </related_skills>

  <see_also>
    <section title="Essential Reading">
      <resource type="book">
        <title>Refactoring: Improving the Design of Existing Code</title>
        <author>Martin Fowler</author>
        <edition>2nd Edition</edition>
        <description>
          The definitive guide to refactoring. Covers the theory, catalog of refactorings,
          and practical advice. Updated for modern programming languages.
        </description>
      </resource>

      <resource type="book">
        <title>Clean Code: A Handbook of Agile Software Craftsmanship</title>
        <author>Robert C. Martin</author>
        <description>
          Teaches principles and practices for writing clean, maintainable code.
          Refactoring is the process of making code clean.
        </description>
      </resource>

      <resource type="book">
        <title>Working Effectively with Legacy Code</title>
        <author>Michael Feathers</author>
        <description>
          Focuses on refactoring code without tests. Provides techniques for adding
          tests to untested code so it can be safely refactored.
        </description>
      </resource>

      <resource type="book">
        <title>Clean Architecture: A Craftsman's Guide to Software Structure</title>
        <author>Robert C. Martin</author>
        <description>
          Explores software architecture principles that guide large-scale refactoring
          decisions.
        </description>
      </resource>

      <resource type="book">
        <title>The Pragmatic Programmer</title>
        <author>Andrew Hunt and David Thomas</author>
        <description>
          Includes practical advice on code maintenance, refactoring, and keeping
          code supple and adaptable.
        </description>
      </resource>
    </section>

    <section title="Online Resources">
      <resource type="website">
        <title>Refactoring Guru</title>
        <url>https://refactoring.guru</url>
        <description>
          Excellent visual catalog of refactoring techniques and design patterns
          with code examples in multiple languages.
        </description>
      </resource>

      <resource type="website">
        <title>Martin Fowler's Refactoring Catalog</title>
        <url>https://refactoring.com/catalog</url>
        <description>
          Online catalog of refactoring techniques from the author of the
          definitive book on refactoring.
        </description>
      </resource>

      <resource type="article">
        <title>Code Smells</title>
        <url>https://en.wikipedia.org/wiki/Code_smell</url>
        <description>
          Overview of common code smells that indicate need for refactoring.
        </description>
      </resource>
    </section>
  </see_also>

  <version_history>
    <entry version="1.0.0" date="2025-01-18">
      <author>blackbox5/core</author>
      <changes>
        <change>Initial version</change>
        <change>Comprehensive refactoring catalog with examples</change>
        <change>SOLID principles and best practices</change>
        <change>Workflow and integration guidelines</change>
        <change>Error handling and rollback strategies</change>
      </changes>
    </entry>
  </version_history>
</skill>
