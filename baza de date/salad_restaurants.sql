SELECT * FROM restaurants;
SELECT * FROM products;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Leaf & Crave',
 'Strada Socrate 3',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660035/banner-photo_szbxyp.jpg',
 'timisoara',
 '300551');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Cucumber Mint Refresher',
 'drinks',
 'Bautura racoritoare cu castravete si menta, preparata din castraveti taiati, frunze proaspete de menta si apa.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660032/truong-dat-kQ_LOSqR-70-unsplash_vihvuo.avif',
 '300ml'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Berry Bliss Smoothie',
 'drinks',
 'Smoothie cu fructe de padure, preparat din zmeura, mure, capsuni, suc de portocale, iaurt grecesc si miere, garnisit cu un cub de lime si rozmarin.',
 5.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660027/sam-moghadam-2NTjAQS0OjE-unsplash_rfjrgc.avif',
 '350ml'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Red Fruit Refresher',
 'drinks',
 'Bautura racoritoare din fructe rosii, preparata cu suc de merisoare, suc de zmeura, suc de lime si sirop simplu, garnisita cu menta.',
 4.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660087/pichara-dhIcEFE0YE4-unsplash_vlrmgi.avif',
 '300ml'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Fresh Orange Juice',
 'drinks',
 'Suc proaspat de portocale, preparat din trei portocale mari, servit cu gheata.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660082/photo-1689066117649-0ca9762fc92c_cpporb.avif',
 '350ml'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Grilled Chicken Greek Salad',
 'salad',
 'Salata greceasca cu pui la gratar, preparata din salata romana, pui la gratar, rosii cherry, castravete, ceapa rosie, ardei portocaliu, masline Kalamata si feta, asezonata cu ulei de masline si otet de vin rosu.',
 8.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660078/photo-1654216548994-eefcba14db5c_efrre1.avif',
 '400g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Mediterranean Roasted Vegetable and Artichoke Salad',
 'salad',
 'Salata mediteraneana cu legume coapte si anghinare, preparata cu anghinare, ardei rosu si galben, fasole verde, masline Kalamata, rosii cherry, feta si paine prajita.',
 9.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660074/photo-1650539688286-ae822d422d30_abq3qu.avif',
 '450g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Roasted Vegetable and Quinoa Bowls with Tahini Dressing',
 'salad',
 'Bol cu legume coapte si quinoa, preparat cu cartof dulce, conopida, naut, avocado, rucola si radisoare, asezat cu dressing tahini.',
 10.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660071/photo-1631311695255-8dde6bf96cb5_igpjls.avif',
 '500g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Peach, Blackberry, and Fennel Salad',
 'salad',
 'Salata cu piersici, mure si telina, preparata din kale rosu, telina subtire, mure, piersici proaspete, nuci, parmesan si seminte de dovleac.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660066/photo-1631311309788-9a37722d05f6_k2c8qt.avif',
 '400g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Quinoa Bowl with Roasted Chickpeas and Kale',
 'salad',
 'Bol de quinoa cu naut copt si kale, preparat cu quinoa, naut, condimente, kale, ceapa rosie, avocado, mazare de zapada si fistic.',
 10.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660062/photo-1623428188474-b1d532c5e560_dsphhk.avif',
 '500g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Citrus Mint Infused Water',
 'drinks',
 'Apa infuzata cu citrice si menta, preparata cu apa, felii de lamaie si lime, frunze de menta si gheata.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660058/photo-1621263764928-df1444c5e859_ykuxg9.avif',
 '400ml'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Shrimp and Avocado Salad',
 'salad',
 'Salata cu creveti si avocado, preparata cu creveti, avocado, verdeata mixta, rosii cherry, feta, masline Kalamata, germeni de floarea-soarelui si ardei rosu.',
 11.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660054/photo-1614098026096-f69b76d1eabc_trfnxo.avif',
 '450g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Spicy Beef and Vegetable Salad',
 'salad',
 'Salata picanta cu vita si legume, preparata cu vita subtire, ardei rosu si verde, castravete, ceapa rosie, sos de soia, otet de orez, ulei de susan si condimente.',
 10.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660050/photo-1608032075746-2e2516ef4a1a_djjkgc.avif',
 '400g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Grilled Steak and Mushroom Salad',
 'salad',
 'Salata cu steak la gratar si ciuperci, preparata cu steak la gratar, salata butter, ciuperci cremini, caju, rosii cherry, coriandru si seminte de mac, asezonata cu vinaigrette balsamic.',
 12.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660046/photo-1607532941433-304659e8198a_zc1icu.avif',
 '400g'),

-- 14
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Chicken Caesar Salad',
 'salad',
 'Salata Caesar cu pui, preparata cu salata romana, pui gatit, crutoane, parmesan si dressing Caesar.',
 8.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660042/photo-1605291535065-e1d52d2b264a_dr7nuh.avif',
 '350g'),

-- 15
((SELECT id FROM restaurants WHERE name = 'Leaf & Crave'),
 'Rainbow Fruit Platter',
 'salad',
 'Platou de fructe colorate, preparat cu banana, mar, mango, rodie, zmeura, mure, afine, pere, portocala, kiwi si struguri verzi.',
 7.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660039/photo-1490474418585-ba9bad8fd0ea_lqyuxf.avif',
 '400g');


 INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Super Fresh Bowls',
 'Strada Socrate 1',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660141/banner-photo_z4zuiq.jpg',
 'timisoara',
 '300551');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Orange Juice with Ice',
 'drinks',
 'Suc de portocale cu gheata, preparat din 4-5 portocale, gheata, apa si o crenguta de menta.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660134/photo-1724213653746-126a098d88df_kjsbtz.avif',
 '350ml'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Refreshing Limeade',
 'drinks',
 'Limonada racoritoare, preparata din apa, zahar, suc de lime si gheata, garnisita cu un wedge de lime.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660153/photo-1508254919937-d4a498e3366c_zkevpo.avif',
 '300ml'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Mango Lassi',
 'drinks',
 'Mango Lassi, preparat cu bucati de mango, iaurt, lapte, miere si un praf de cardamom, servit cu gheata.',
 5.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660149/julia-zyablova-KlVIYmGVRQ8-unsplash_uf8aej.avif',
 '350ml'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Watermelon Slush',
 'drinks',
 'Watermelon Slush, preparat din pepene cuburi, apa, suc de lime si zahar, cu garnish de pepene.',
 4.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660145/great-cocktails-KUT4HK3-Z5s-unsplash_ovxpr3.avif',
 '400ml'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Strawberry Biscuit Smoothie',
 'drinks',
 'Smoothie cu capsuni, lapte, iaurt si biscuiti digestive, preparat cu capsuni congelate si miere, garnisit cu capsuni proaspete.',
 5.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660138/alexander-mils-wBIeri0fLuw-unsplash_ab1v9p.avif',
 '350ml'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Tuna and Arugula Salad with Hard-Boiled Eggs',
 'salad',
 'Salata cu ton, rucola si oua fierte, preparata din ton in conserva, rucola, oua, rosii cherry si dressing simplu.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660130/photo-1604909052743-94e838986d24_lv6auu.avif',
 '400g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Crispy Chicken and Brussels Sprout Salad',
 'salad',
 'Salata cu pui crocant si varza de Bruxelles, preparata din verdeata mixta, varza de Bruxelles coapta, ceapa rosie si pui prajit crocant, cu vinaigrette de capsuni.',
 10.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660195/photo-1603911036147-2f35cce108ef_ehbmix.avif',
 '350g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Grilled Chicken and Citrus Salad',
 'salad',
 'Salata cu pui la gratar si citrice, preparata din pui la gratar, verdeata mixta, segmente de mandarine, stafide si parmezan, asezonata cu ulei de masline si otet balsamic.',
 10.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660190/photo-1599345585307-91babe6535a3_ttdhcx.avif',
 '400g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Caprese Salad with Crostini',
 'salad',
 'Salata Caprese cu crostini, preparata din rosii proaspete, mozzarella, busuioc si crostini de paine prajita, asezonata cu ulei de masline.',
 9.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660182/photo-1592417817098-8fd3d9eb14a5_dvlfyo.avif',
 '350g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Chicken Caesar Salad',
 'salad',
 'Salata Caesar cu pui, preparata din salata romana, pui la gratar, crutoane, parmezan si dressing Caesar, cu rosii cherry.',
 8.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660178/photo-1580013759032-c96505e24c1f_jzepmh.avif',
 '350g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Greek Salad',
 'salad',
 'Salata greceasca, preparata cu feta, rosii, castravete, ceapa rosie, ardei verde si ulei de masline, asezonata cu otet de vin rosu si busuioc.',
 8.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660174/photo-1573409157844-6a56035363fc_ornyj8.avif',
 '300g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Grilled Chicken and Asian Slaw Salad',
 'salad',
 'Salata cu pui la gratar si slaw asiatic, preparata din pui la gratar, varza Napa, castravete, rosii cherry, condimente asiatice si dressing din miere si soia.',
 10.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660170/photo-1566935367576-6e0e852215d1_nquatc.avif',
 '400g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Caesar Salad with Grilled Chicken and Hard-Boiled Egg',
 'salad',
 'Salata Caesar cu pui la gratar si ou fiert, preparata din salata romana, pui la gratar, crutoane, ou fiert, parmezan si rosii cherry, cu dressing Caesar.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660165/photo-1522251253478-4cae03d93949_v06zri.avif',
 '400g'),

-- 14
((SELECT id FROM restaurants WHERE name = 'Super Fresh Bowls'),
 'Sautéed Mushroom and Spinach Toast',
 'salad',
 'Toast cu ciuperci sotate si spanac, preparat din paine integrala, ciuperci cremini, spanac si rosii cherry, asezonat cu ulei de masline, sare si piper.',
 7.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660161/photo-1521001561976-a717fb67bce7_xsxgml.avif',
 '250g');
