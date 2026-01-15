import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { startTelegramBot, bot } from './services/telegramService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(helmet());


app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {

    origin: ["https://grocy-web.vercel.app" , "http://localhost:3000" , "https://58a07fc147ce.ngrok-free.app"],
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


// Database Connection
connectDB();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', siteSettingsRoutes);
app.use('/api/storeBoot', storeRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('E-commerce API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log('About to initialize Telegram bot...');
    startTelegramBot().catch((err) => {
      console.error('Telegram bot start failed', err);
    });
  });
}

// Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));
export default app;
