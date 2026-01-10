import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
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

  const addToCart = (itemToAdd, recipeInfo = null) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === itemToAdd._id);

      if (existingItemIndex > -1) {
        const newCart = [...prevItems];
        const existingItem = newCart[existingItemIndex];
        const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
        
        if (recipeInfo && !existingItem.recipes.some(r => r.id === recipeInfo.id)) {
          updatedItem.recipes = [...existingItem.recipes, recipeInfo];
        }
        newCart[existingItemIndex] = updatedItem;
        return newCart;
      } else {
        const newRecipes = recipeInfo ? [recipeInfo] : [];
        return [...prevItems, { ...itemToAdd, quantity: 1, recipes: newRecipes, cartItemId: Date.now() }];
      }
    });
  };

  const addAllToCart = (itemsToAdd, recipeInfo) => {
    setCartItems(prevItems => {
      // Use a Map for efficient lookup of items already in the cart
      const cartMap = new Map(prevItems.map(item => [item._id, item]));
  
      itemsToAdd.forEach(itemToAdd => {
        if (cartMap.has(itemToAdd._id)) {
          // Item exists, update it
          const existingItem = cartMap.get(itemToAdd._id);
          const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
          if (recipeInfo && !existingItem.recipes.some(r => r.id === recipeInfo.id)) {
            updatedItem.recipes = [...existingItem.recipes, recipeInfo];
          }
          cartMap.set(itemToAdd._id, updatedItem);
        } else {
          // New item, add to cart
          const newRecipes = recipeInfo ? [recipeInfo] : [];
          // Use a more unique ID to prevent collisions within the same batch
          const cartItemId = `${Date.now()}-${Math.random()}`;
          cartMap.set(itemToAdd._id, {
            ...itemToAdd,
            quantity: 1,
            recipes: newRecipes,
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
