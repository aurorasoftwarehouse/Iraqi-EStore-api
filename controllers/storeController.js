import StoreOwner from '../models/StoreOwner.js';

export const createStoreId = async (req, res) => {
  try {
    const { ownerName, password ,storeId} = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to create a store owner entry.' });
    }

    const newStoreOwner = new StoreOwner({
      storeId:storeId,
      ownerName: ownerName || 'Default Owner',
      password: password,
      ownerChatId: null, // Will be updated by Telegram bot
    });

    await newStoreOwner.save();

    res.status(201).json({ message: 'Store Owner entry created successfully', storeOwnerId: newStoreOwner._id });
  } catch (error) {
    console.error('Error creating store owner entry:', error);
    res.status(500).json({ message: 'Failed to create store owner entry', error: error.message });
  }
};


export const getStoreall = async (req, res) => {
  try {
    const storeOwners = await StoreOwner.find();
    res.status(200).json(storeOwners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve store owners', error: error.message });
  }
  
}

export const DELETEall = async (req, res) => {
  try {
    await StoreOwner.deleteMany({});
    res.status(200).json({ message: 'All store owners deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete store owners', error: error.message });
  }
}

export const deleteStoreOwner = async (req, res) => {
  try {
    const { storeOwnerId } = req.params;
    const deletedStoreOwner = await StoreOwner.findByIdAndDelete(storeOwnerId);
    if (!deletedStoreOwner) {
      return res.status(404).json({ message: 'Store Owner not found' });
    }
    res.status(200).json({ message: 'Store Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Store Owner', error: error.message });
  }
}