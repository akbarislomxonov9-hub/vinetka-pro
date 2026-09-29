# Vinetka Studio

You are an expert frontend engineer and UI/UX designer specializing in advanced photo editors and canvas-based design tools.

Build a premium, production-ready **Vinetka Editor** (school class photo collage maker) with the following exact requirements:

### Core Features
- Users can upload up to 50 photos (drag & drop + file picker)
- Each photo can have a name written underneath
- Special large central slot called “Bosh o‘quvchi” (main student) — bigger size + name
- Multi-page support (Page 1, Page 2, Page 3...). User can freely switch between pages and continue designing
- 30 beautiful pre-made backgrounds + ability to upload custom background
- Real-time canvas where photos can be freely dragged, resized, and arranged
- Auto-arrange button (neat grid layout)
- Live preview that looks exactly like the final result
- Export as high-quality PDF and PNG

### Design & UX (Very Important)
- Modern, elegant, premium look
- Soft navy + gold color palette
- Instead of normal loading spinner:
  - Beautiful skeleton loaders with shimmer
  - When generating PDF: elegant progress bar + percentage + floating photo cards animation + text “Vinetkangiz tayyorlanmoqda...”
- Smooth drag & drop with visual feedback
- Soft scale + fade animations when photos are added
- Toast notifications: “Rasm qo‘shildi”, “Fon o‘zgartirildi”, “Saqlandi”
- Auto-save draft every 10 seconds
- Mobile-friendly (touch drag support)

### Technical Stack Preference
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Canvas library: Fabric.js or Konva.js (prefer Konva)
- State management: Zustand
- PDF generation: @react-pdf/renderer or html2canvas + jspdf

### UI Structure
1. Top bar: Project name, Save, Export PDF, Export PNG, Page switcher (1 | 2 | 3...)
2. Left sidebar: Photos list + Upload button + “Bosh o‘quvchi” selector
3. Center: Large interactive canvas
4. Right sidebar: Backgrounds (30 thumbnails) + Custom upload + Arrangement tools

Write clean, well-structured, production-quality code. Start with the complete component structure and then implement the canvas logic step by step.    You are a senior backend developer specializing in Telegram bots and real-time notification systems.

Create a complete Telegram bot for the “Vinetka & Toy Albom” platform with the following exact requirements:

### Bot Modes

**1. Regular User Mode**

- /start — Welcome message + main menu (inline keyboard)

- Yangi buyurtma berish

- Mening buyurtmalarim

- Narxlar

- Yordam / Admin bilan bog‘lanish

- Buyurtma holatini ko‘rish

**2. Admin Mode (only for the owner)**

- Real-time notifications for every new registered user

- Real-time notifications for every new order

- Ability to change order status:

  - Qabul qilindi

  - Ishlanmoqda

  - Tayyor

  - Yetkazib berildi

- Send private message to any user

- View basic statistics (today’s orders, total users)

### Notification Format (very important)

When a new user registers, send this clean message to Admin:

🎉 Yangi foydalanuvchi!

Ism: [Full Name]

Email: [email]

Telefon: [phone]

Vaqt: [date and time]

When a new order is placed, send this detailed message:

📦 Yangi buyurtma!

Buyurtma raqami: #ORD-2025-001

Turi: Vinetka / Toy Albom

Foydalanuvchi: [Name]

Telefon: [phone]

Rasmlar soni: 48

Betlar soni: 2

Izoh: [user note]

Holat: Yangi

[View Design] button (link to admin panel)

### Technical Requirements

- Library: Telegraf or grammY (prefer Telegraf)

- Database: PostgreSQL + Prisma (or Supabase)

- Store all users and orders in database

- Secure admin check (only specific Telegram ID can access admin  commands)

- Beautiful inline keyboards

- Clean and professional message formatting using MarkdownV2 or HTML

### User Flow Connection

When user finishes designing on the website and clicks “Buyurtma berish”:

1. Order is saved in database

2. Bot immediately sends detailed notification to Admin

3. User receives confirmation message in bot (if they started the bot)

Write production-ready code. First show the bot structure, then implement user commands, then admin notifications and status management.  mana admin id : 7033912501   mana bot token : @secret:TELEGRAM_BOT_TOKEN    va regstaratsiasiz saytga kirsin

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d03c8bc4-473e-5f0c-a802-00cb78658015).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
