SELECT * FROM restaurants;
SELECT * FROM products;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Sushi SoySmooth',
 'Strada Marasesti 11',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660374/banner-photo_jzav3t.jpg',
 'timisoara',
 '300254');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Spicy Salmon Roll',
 'sushi',
 'Roll de somon picant cu orez sushi, otet, zahar si sare, invelit in nori, completat cu creveti fierti, avocado, castravete, somon, tobiko, maioneza, sriracha si ceapa verde.',
 16.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660369/photo-1694763638769-811c61c69ebc_soinda.avif',
 '200g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Spicy Salmon Sushi Roll',
 'sushi',
 'Roll de sushi picant cu somon, preparat cu orez sushi, otet, zahar si sare, maioneza, sriracha, ceapa verde, avocado si castravete.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660455/photo-1694763637523-85d9dcbc408e_arqrrt.avif',
 '220g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Tuna Maki Sushi',
 'sushi',
 'Maki de ton, preparat cu orez sushi, otet, zahar si sare, foi de nori si ton sushi-grade.',
 15.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660450/photo-1675870793127-85e11d214303_pz2ket.avif',
 '180g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Sushi Platter',
 'sushi',
 'Platou de sushi cu o varietate de preparate: somon, crab, cream cheese, avocado, wasabi, ghimbir murat si seminte de susan.',
 28.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660435/photo-1667343352641-044b9d729737_ltaaqx.avif',
 '300g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Salmon Avocado Sushi Rolls',
 'sushi',
 'Rolluri de sushi cu somon si avocado, preparate cu orez sushi, otet, zahar si sare, felii subtiri de somon si avocado, si seminte de susan.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660421/photo-1666307534071-3c794b101c82_rjufwj.avif',
 '210g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Vegetarian Sushi Rolls',
 'sushi',
 'Rolluri vegetariene de sushi cu tofu, morcov ras, salata si castravete, invelite in nori, cu sos de soia si otet pentru gust.',
 16.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660416/photo-1659793687245-c53e5aa56238_sjsseu.avif',
 '200g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Spicy Salmon Appetizer',
 'sushi',
 'Aperitiv picant de somon, preparat cu somon sushi, maioneza, sriracha, otet de orez, ulei de susan, ghimbir, jalapeno si optional shiso.',
 14.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660411/photo-1648146299594-5d36e9c44835_tlepqw.avif',
 '150g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Spicy Tuna Sushi Rolls',
 'sushi',
 'Rolluri de sushi picante cu ton, preparate cu orez sushi, otet, zahar si sare, ton fin, maioneza, sriracha, seminte, tobiko, migdale, radis si ceapa verde.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660407/photo-1648146299573-8763b7e478b1_jx9s5n.avif',
 '220g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Spicy Crab Rolls',
 'sushi',
 'Rolluri de sushi cu crab picant, preparate cu orez sushi, otet, zahar si sare, carne de crab, somon proaspat, maioneza picanta si seminte de susan.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660401/photo-1648146299493-301461058f45_ys6gtb.avif',
 '210g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Salmon & Cream Cheese Bites',
 'sushi',
 'Bucatele de sushi cu somon afumat si cream cheese, garnisite cu radis, ceapa verde si spanac, stropite cu sos de soia.',
 13.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660397/photo-1648146299406-3c58c422cb9e_rhqn4b.avif',
 '120g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'Tuna Sushi Rolls',
 'sushi',
 'Rolluri de sushi cu ton, preparate cu orez sushi, otet, zahar si sare, ton fin, maioneza, sriracha, ulei de susan, foi de nori si seminte.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660392/photo-1648146299381-5f4db5d842a0_bsem7x.avif',
 '200g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Sushi SoySmooth'),
 'California Roll Sushi',
 'sushi',
 'Rolluri California cu avocado, carne de crab imitat, tobiko si nori, preparate cu orez sushi, otet, zahar si sare, si garnisite cu seminte si ierburi.',
 15.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660378/photo-1648146298999-2c084001c28b_cgue6t.avif',
 '190g');


 INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('ZushiZa',
 'Strada Marasesti 6',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660500/banner-photo_liygx8.jpg',
 'timisoara',
 '300077');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Philadelphia Roll',
 'sushi',
 'Roll de Philadelphia: orez sushi, otet de orez, zahar, sare, 8 foi nori, avocado felii subtiri, castravete felii subtiri, cream cheese, somon afumat, sos de soia, wasabi, ghimbir murat.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660495/photo-1635526910429-051cf1ed127e_ogyvef.avif',
 '250g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Crab Sushi Roll',
 'sushi',
 'Roll de crab: carne de crab fiarta, maioneza, sriracha, suc de lamaie, sare, piper, 1/2 cana orez sushi, o foaie nori, varza rosie rasa pentru garnisire.',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660565/photo-1635526910370-6881e1756fee_vnuv2p.avif',
 '230g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Crab Sushi Bites',
 'sushi',
 'Bucatele de sushi cu crab: carne de crab fiarta, maioneza, otet de orez, ulei de susan, sare, piper, o foaie nori, orez sushi, microgreens pentru garnisire.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660560/photo-1635526909227-6425a804c57e_suhofg.avif',
 '180g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Cream Cheese and Poppy Seed Sushi',
 'sushi',
 'Roll de sushi cu cream cheese si seminte: orez sushi, otet de orez, zahar, sare, cream cheese, seminte de mac, suc de lamaie, condimente, foi nori, ceapa verde/microgreens.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660554/photo-1635526909180-87e0af34ba69_kbrzqk.avif',
 '200g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Spicy Tuna & Salmon Sushi Bites',
 'sushi',
 'Bucatele picante de sushi: orez sushi, otet de orez, zahar, sare, ton si somon taiate fin, ceapa rosie, maioneza, sriracha, jalapeno, seminte de susan, foi nori (optional).',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660544/photo-1627462133149-167e7e9a91b7_i3wes4.avif',
 '210g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Avocado Sushi',
 'sushi',
 'Roll de sushi cu avocado: orez sushi, otet de orez, zahar, sare, somon afumat, cream cheese, avocado, foi nori, sos de soia, ghimbir murat, wasabi, ghimbir murat.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660539/photo-1617196905100-216ffe128142_efpse1.avif',
 '220g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Cream Cheese Sushi Rolls',
 'sushi',
 'Rolluri de sushi cu cream cheese: orez sushi, otet de orez, zahar, sare, foi nori, cream cheese, creveti sau carne de crab, avocado, seminte de susan, ceapa prajita, sos de soia.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660534/photo-1617196034943-e2c9989c9d1f_pdlhlg.avif',
 '210g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Salmon Sushi Rolls',
 'sushi',
 'Rolluri de sushi cu somon: orez sushi, otet de orez, zahar, sare, foi nori, somon sushi-grade, wasabi, sos de soia, ghimbir murat, ghimbir murat.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660529/photo-1617196034738-26c5f7c977ce_blqtl5.avif',
 '220g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Unagi and Ikura Sushi',
 'sushi',
 'Roll de sushi cu unagi si ikura: unagi gatit, orez sushi, ikura, foi nori, sos unagi, otet de sushi.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660519/photo-1607247098982-7b64021a4bf5_cuer07.avif',
 '230g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Shrimp Sushi (Ebi Sushi)',
 'sushi',
 'Ebi sushi: orez sushi, otet de orez, zahar, sare, 4 creveti mari, foi nori (optional).',
 17.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660509/photo-1607247098912-8b2b44fde4d6_ih8gfl.avif',
 '200g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'ZushiZa'),
 'Salmon Nigiri',
 'sushi',
 'Nigiri de somon: orez sushi, otet de orez, zahar, sare, o felie de somon proaspat.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660505/photo-1607247098731-5bf6416d2e8c_aa99bg.avif',
 '180g');
