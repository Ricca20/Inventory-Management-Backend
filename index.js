import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import router from './routes/productRoute.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Agri-Waste Backend API is running...');
});

app.use('/product', router);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));