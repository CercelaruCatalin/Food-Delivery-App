SELECT * FROM restaurants;
SELECT * FROM products;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('The Comic Cappuccino',
 'Strada Protopop George Dragomir 6',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661145/banner-photo_f79f3v.jpg',
 'timisoara',
 '300230');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Pain au Chocolat',
 'pastry',
 'Pain au Chocolat: aluati dulce preparat din faina, zahar, sare, unt, lapte caldut, ou, drojdie si ciocolata neagra tocata.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661129/photo-1613929231151-d7571591259e_h8ozlu.avif',
 '100g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Croissant',
 'pastry',
 'Croissant: pate croissant din faina de grau, drojdie, zahar, sare, apa calda si unt, cu textura pufoasa si crocanta.',
 2.80,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661123/photo-1599940778173-e276d4acb2bb_dkh1mr.avif',
 '80g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Macarons',
 'pastry',
 'Macarons: dulciuri franceze din faina de migdale, zahar pudra, albusuri si zahar, cu umplutura ganache sau gem, colorate optional.',
 1.80,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661111/photo-1576618148367-557c39975095_jzfk2e.avif',
 '30g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Cinnamon Roll',
 'pastry',
 'Cinnamon Roll: rulou cu scortisoara, preparat din lapte caldut, drojdie, zahar, ou, unt topit, faina, unt moale, zahar brun si scortisoara.',
 3.75,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661104/photo-1564354151628-01f04c6c40a7_qrjboi.avif',
 '110g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Simple Lemon Glaze Pound Cake',
 'pastry',
 'Pound Cake cu glazura de lamaie: tort dens preparat din faina, unt, zahar, oua, vanilie, lapte, coaja si suc de lamaie, acoperit cu pudra de zahar.',
 4.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661099/photo-1514435390218-898a0e01517a_tnspx0.avif',
 '400g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Cinnamon Roll Cake with Blueberries',
 'pastry',
 'Tort cu rulouri de scortisoara si afine: preparat din aluat de cinnamon roll, unt, zahar pudra, lapte, vanilie si afine proaspete.',
 5.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661208/photo-1506459225024-1428097a7e18_jm1aug.avif',
 '450g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Chocolate Cookies',
 'pastry',
 'Biscuiti cu ciocolata: preparati din unt, zahar, oua, faina, bicarbonat, sare, bucati de ciocolata semi-dulce si sare de mare.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661202/photo-1499636136210-6f4ee915583e_p4nvfd.avif',
 '50g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Mocha',
 'drinks',
 'Mocha: bautura calda din espresso, lapte aburit si sirop de ciocolata, optional cu frisca si ciocolata rasa.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661196/milk_coffee_myganf.avif',
 '250ml'),

-- 9
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Iced Latte',
 'drinks',
 'Iced Latte: bautura rece din 2 shoturi de espresso, lapte integral, gheata si zahar.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661191/iced_coffee_qvwvsh.webp',
 '300ml'),

-- 10
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Iced Coffee with Whipped Cream and Banana',
 'drinks',
 'Iced Coffee cu frisca si banana: cafea tare racoritoare, frisca, zahar pudra, extract de vanilie si banana felii.',
 3.75,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661185/frappe_miyovw.webp',
 '350ml'),

-- 11
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Basque Burnt Cheesecake with Espresso',
 'drinks',
 'Basque Burnt Cheesecake with Espresso: desert cremos cu aroma intensa de espresso, preparat din cream cheese, zahar, smantana, faina, oua, vanilie si optional smantana.',
 5.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661179/espresso_csta3s.avif',
 '300g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Cortado',
 'drinks',
 'Cortado: bautura din 1 shot espresso si lapte aburit.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661168/cortado_wbxml8.webp',
 '150ml'),

-- 13
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Chocolate Cappuccino',
 'drinks',
 'Chocolate Cappuccino: espresso, lapte aburit si sirop de ciocolata, optional cu frisca si ciocolata rasa pentru decor.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661162/chocolate_cappucino_ywczqp.webp',
 '250ml'),

-- 14
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Caramel Cappuccino',
 'drinks',
 'Caramel Cappuccino: espresso, lapte aburit si sirop de ciocolata, garnisit cu frisca si caramel.',
 3.75,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661157/caramel_cappucino_jpxirt.avif',
 '250ml'),

-- 15
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Cappuccino',
 'drinks',
 'Cappuccino: shot de espresso, lapte integral aburit si pudra de cacao.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661151/cappucino_yzs3xv.webp',
 '200ml'),

-- 16
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Americano',
 'drinks',
 'Americano: bautura de cafea diluata preparata cu espresso diluat, obtinand un gust usor si placut.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661139/americano_saciic.webp',
 '250ml'),

-- 17
((SELECT id FROM restaurants WHERE name = 'The Comic Cappuccino'),
 'Affogato',
 'drinks',
 'Affogato: cafea tare racoritoare servita cu doua cupe de inghetata de capsuni si boabe de cafea pentru decor.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742661134/affogato_c0uohy.webp',
 '300ml');
