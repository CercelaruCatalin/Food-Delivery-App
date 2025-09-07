SELECT * FROM PRODUCTS;
SELECT * FROM PRODUCT_EXTRAS;
SELECT * FROM EXTRAS;
SELECT * FROM SIZES;
SELECT * FROM RESTAURANTS;

-- Insert extras for Grazie Ragazzi Pizza
INSERT INTO extras (restaurant_id, name) VALUES
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Extra Cheese'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Extra Pepperoni'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Mushrooms'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Olives'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Bacon'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Hot Peppers'),
((SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza'), 'Chicken');

-- Insert extras for The Pizza President
INSERT INTO extras (restaurant_id, name) VALUES
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Extra Cheese'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Extra Pepperoni'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Mushrooms'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Olives'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Bacon'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Hot Peppers'),
((SELECT id FROM restaurants WHERE name = 'The Pizza President'), 'Chicken');

-- Insert sizes for all pizza products at Grazie Ragazzi Pizza
DO $$
DECLARE
    pizza_id INT;
BEGIN
    FOR pizza_id IN (SELECT id FROM products WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza') AND category_name = 'pizza')
    LOOP
        -- Small size (base price - 3)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Small', (SELECT price_per_item - 3 FROM products WHERE id = pizza_id));
        
        -- Medium size (base price)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Medium', (SELECT price_per_item FROM products WHERE id = pizza_id));
        
        -- Large size (base price + 3)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Large', (SELECT price_per_item + 3 FROM products WHERE id = pizza_id));
        
        -- Family size (base price + 6)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Family', (SELECT price_per_item + 6 FROM products WHERE id = pizza_id));
    END LOOP;
END $$;

-- Insert sizes for all pizza products at The Pizza President
DO $$
DECLARE
    pizza_id INT;
BEGIN
    FOR pizza_id IN (SELECT id FROM products WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President') AND category_name = 'pizza')
    LOOP
        -- Small size (base price - 3)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Small', (SELECT price_per_item - 3 FROM products WHERE id = pizza_id));
        
        -- Medium size (base price)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Medium', (SELECT price_per_item FROM products WHERE id = pizza_id));
        
        -- Large size (base price + 3)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Large', (SELECT price_per_item + 3 FROM products WHERE id = pizza_id));
        
        -- Family size (base price + 6)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (pizza_id, 'Family', (SELECT price_per_item + 6 FROM products WHERE id = pizza_id));
    END LOOP;
END $$;

-- Insert size for drink
DO $$
DECLARE
    drink_id INT;
BEGIN
    FOR drink_id IN (SELECT id FROM products WHERE category_name = 'drinks')
    LOOP
        -- Small size (base price - 1)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (drink_id, 'Small', (SELECT price_per_item - 1 FROM products WHERE id = drink_id));
        
        -- Medium size (base price)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (drink_id, 'Medium', (SELECT price_per_item FROM products WHERE id = drink_id));
        
        -- Large size (base price + 1)
        INSERT INTO sizes (product_id, size_name, price)
        VALUES (drink_id, 'Large', (SELECT price_per_item + 1 FROM products WHERE id = drink_id));
    END LOOP;
END $$;

-- Associate extras with pizza products for Grazie Ragazzi Pizza
DO $$
DECLARE
    pizza_id INT;
BEGIN
    FOR pizza_id IN (SELECT id FROM products WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza') AND category_name = 'pizza')
    LOOP
        -- Extra Cheese
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Extra Cheese' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            2.50
        );
        
        -- Extra Pepperoni
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Extra Pepperoni' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            2.00
        );
        
        -- Mushrooms
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Mushrooms' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            1.50
        );
        
        -- Olives
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Olives' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            1.50
        );
        
        -- Bacon
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Bacon' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            2.50
        );
        
        -- Hot Peppers
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Hot Peppers' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            1.00
        );
        
        -- Chicken
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Chicken' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Grazie Ragazzi Pizza')), 
            2.50
        );
    END LOOP;
END $$;

-- Associate extras with pizza products for The Pizza President
DO $$
DECLARE
    pizza_id INT;
BEGIN
    FOR pizza_id IN (SELECT id FROM products WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President') AND category_name = 'pizza')
    LOOP
        -- Extra Cheese
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Extra Cheese' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            2.50
        );
        
        -- Extra Pepperoni
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Extra Pepperoni' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            2.00
        );
        
        -- Mushrooms
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Mushrooms' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            1.50
        );
        
        -- Olives
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Olives' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            1.50
        );
        
        -- Bacon
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Bacon' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            2.50
        );
        
        -- Hot Peppers
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Hot Peppers' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            1.00
        );
        
        -- Chicken
        INSERT INTO product_extras (product_id, extra_id, price)
        VALUES (
            pizza_id, 
            (SELECT extra_id FROM extras WHERE name = 'Chicken' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Pizza President')), 
            2.50
        );
    END LOOP;
END $$;