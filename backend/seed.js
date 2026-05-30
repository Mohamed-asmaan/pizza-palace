require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pizza = require('./models/Pizza');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Pizza.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@pizzapalace.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Demo Customer',
      email: 'customer@pizzapalace.com',
      password: 'customer123',
      role: 'customer',
    });

    const pizzas = [
      {
        name: 'Margherita Classic',
        description: 'Fresh tomato sauce, mozzarella, and basil on a crispy crust.',
        price: 299,
        category: 'Veg',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        isAvailable: true,
      },
      {
        name: 'Farmhouse Feast',
        description: 'Loaded with capsicum, onions, tomatoes, and sweet corn.',
        price: 399,
        category: 'Veg',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        isAvailable: true,
      },
      {
        name: 'Pepperoni Blast',
        description: 'Double pepperoni with extra cheese for meat lovers.',
        price: 449,
        category: 'Non-Veg',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        isAvailable: true,
      },
      {
        name: 'Chicken Tikka Pizza',
        description: 'Tandoori chicken tikka with mint chutney and onions.',
        price: 499,
        category: 'Non-Veg',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        isAvailable: true,
      },
      {
        name: 'BBQ Chicken Supreme',
        description: 'Smoky BBQ sauce, grilled chicken, and red onions.',
        price: 529,
        category: 'Non-Veg',
        imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
        isAvailable: true,
      },
      {
        name: 'Truffle Mushroom',
        description: 'Premium truffle oil, wild mushrooms, and white sauce.',
        price: 599,
        category: 'Specialty',
        imageUrl: 'https://images.unsplash.com/photo-1548365320-0f2e5812b5b1?w=400',
        isAvailable: true,
      },
      {
        name: 'Four Cheese Delight',
        description: 'Mozzarella, cheddar, parmesan, and gorgonzola blend.',
        price: 549,
        category: 'Specialty',
        imageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
        isAvailable: true,
      },
      {
        name: 'Paneer Makhani',
        description: 'Creamy makhani sauce with spiced paneer cubes.',
        price: 429,
        category: 'Veg',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
        isAvailable: true,
      },
    ];

    await Pizza.insertMany(pizzas);

    console.log('Seed completed successfully');
    console.log(`Admin login: ${admin.email} / admin123`);
    console.log('Customer login: customer@pizzapalace.com / customer123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
