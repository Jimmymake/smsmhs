flowchart TD

A[User Opens Payment Page] --> B[Fill Customer Name]
B --> C[Fill Customer Email]
C --> D[Select Country]

D --> E{Country Selected?}
E -- No --> D
E -- Yes --> F[Load Available Currencies]

F --> G[Select Currency]
G --> H[Enter Amount]
H --> I[Enter Payer Phone]
I --> J[Enter Description]

J --> K[Click PAY NOW]

K --> L{Validate All Fields}
L -- Missing/Invalid Data --> M[Show Error Message]
M --> B

L -- Valid Data --> N[Create Payment Request]
N --> O[Send to Payment API]
O --> P{API Response}

P -- Success --> Q[Generate Payment Link / Trigger STK Push]
Q --> R[Show Success Message]

P -- Failure --> S[Show Failure Message]
S --> B
