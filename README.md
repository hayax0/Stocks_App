# 📈 Signalist - AI-Powered Investment Platform


**Signalist** is a full-stack investment analysis platform designed to help users track market trends. It leverages **Generative AI** to provide personalized onboarding experiences and financial insights based on the user's risk profile.

The project focuses on a robust **Event-Driven Architecture**, ensuring that heavy tasks (like AI generation and email dispatch) are handled asynchronously without impacting the user experience.

---


##  Key Features

 **AI-Powered Onboarding:** Uses **Google Gemini** to analyze user data (investment goals, risk tolerance) and generate personalized welcome emails in real-time.
 **Event-Driven Architecture:** Integrated with **Inngest** to handle background jobs and queues. User actions trigger asynchronous events for reliable data processing.
 **Financial Dashboard:** Real-time visualization of market data (Stocks, Crypto) with interactive charts.
 **Secure Authentication:** Robust auth system using **Better-Auth** with secure session management (HttpOnly Cookies) and Middleware protection.
 **Automated Email System:** Transactional emails sent via **Resend**, orchestrated by Inngest workflows.
 **Desktop-First Design:** Optimized for large screens to provide detailed analytical tools and charts.

---

## Tech Stack

### Core
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)

### Backend & Infrastructure
* **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose)
* **Event Bus / Queues:** [Inngest](https://www.inngest.com/)
* **AI Model:** [Google Gemini API](https://ai.google.dev/)
* **Email Service:** [Resend](https://resend.com/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## Architecture

The application follows a modern serverless architecture:

1.  **User Action:** User signs up via the frontend.
2.  **Auth Layer:** Session is created and stored securely.
3.  **Event Trigger:** An event `app/user.created` is sent to Inngest.
4.  **Background Job:** Inngest picks up the event asynchronously.
    * *Step 1:* Fetches user profile data.
    * *Step 2:* Calls **Google Gemini** to generate a personalized intro text.
    * *Step 3:* Sends the email via **Resend**.
5.  **Completion:** User receives the email without loading delays on the site.

---

## Getting Started

Follow these steps to run the project locally:

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas URI
* API Keys for Google Gemini, Resend, and Inngest.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/seu-usuario/signalist.git](https://github.com/seu-usuario/signalist.git)
    cd signalist
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add the following:

    ```env
    # Database
    DATABASE_URL=your_mongodb_connection_string

    # Auth
    BETTER_AUTH_SECRET=your_auth_secret
    NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000

    # AI & Email
    GEMINI_API_KEY=your_gemini_key
    RESEND_API_KEY=your_resend_key

    # Inngest
    INNGEST_EVENT_KEY=local
    INNGEST_SIGNING_KEY=your_inngest_signing_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Start Inngest Dev Server (for background jobs)**
    In a separate terminal:
    ```bash
    npx inngest-cli@latest dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Roadmap & Improvements

* [ ] **Mobile Optimization:** Refactor layouts for better mobile responsiveness.
* [ ] **Advanced Charts:** Add technical indicators (RSI, MACD) to the dashboard.
* [ ] **Portfolio Tracking:** Allow users to add manual transactions.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by **Caio Campos**.