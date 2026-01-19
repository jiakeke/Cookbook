import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCartItems = localStorage.getItem('cartItems');
      return storedCartItems ? JSON.parse(storedCartItems) : [];
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemToAdd, recipeInfos = []) => {
    const recipesToAdd = Array.isArray(recipeInfos) ? recipeInfos : (recipeInfos ? [recipeInfos] : []);
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === itemToAdd._id);

      if (existingItemIndex > -1) {
        const newCart = [...prevItems];
        const existingItem = newCart[existingItemIndex];
        
        const existingRecipeIds = new Set(existingItem.recipes.map(r => r.id));
        const newUniqueRecipes = recipesToAdd.filter(r => !existingRecipeIds.has(r.id));
        
        const updatedItem = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          recipes: [...existingItem.recipes, ...newUniqueRecipes]
        };
        
        newCart[existingItemIndex] = updatedItem;
        return newCart;
      } else {
        return [...prevItems, { ...itemToAdd, quantity: 1, recipes: recipesToAdd, cartItemId: Date.now() }];
      }
    });
  };

  const addAllToCart = (itemsToAdd, recipeInfo) => {
    const recipesToAdd = recipeInfo ? [recipeInfo] : [];

    setCartItems(prevItems => {
      const cartMap = new Map(prevItems.map(item => [item._id, item]));
  
      itemsToAdd.forEach(itemToAdd => {
        if (cartMap.has(itemToAdd._id)) {
          const existingItem = cartMap.get(itemToAdd._id);
          
          const existingRecipeIds = new Set(existingItem.recipes.map(r => r.id));
          const newUniqueRecipes = recipesToAdd.filter(r => !existingRecipeIds.has(r.id));

          const updatedItem = { 
            ...existingItem, 
            quantity: existingItem.quantity + 1,
            recipes: [...existingItem.recipes, ...newUniqueRecipes]
          };
          cartMap.set(itemToAdd._id, updatedItem);
        } else {
          const cartItemId = `${Date.now()}-${Math.random()}`;
          cartMap.set(itemToAdd._id, {
            ...itemToAdd,
            quantity: 1,
            recipes: recipesToAdd,
            cartItemId: cartItemId
          });
        }
      });
  
      return Array.from(cartMap.values());
    });
  };

  const decreaseQuantity = (cartItemId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.cartItemId === cartItemId);
      if (existingItem && existingItem.quantity === 1) {
        return prevItems.filter(item => item.cartItemId !== cartItemId);
      } else {
        return prevItems.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, addAllToCart, decreaseQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;