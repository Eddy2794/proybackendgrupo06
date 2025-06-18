import mongoose from 'mongoose';

// Configuración específica para tests
const connectTestDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    // Usar MongoDB en memoria o base de datos de test
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/proybackendgrupo06_test';
    
    await mongoose.connect(MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test MongoDB connected');
  }
};

const closeTestDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log('✅ Test MongoDB closed');
  }
};

const clearTestDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

export { connectTestDB, closeTestDB, clearTestDB };
