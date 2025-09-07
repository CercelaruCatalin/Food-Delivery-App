SELECT * FROM restaurants;
SELECT * FROM products;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Roger''s Bakery',
 'Bulevardul Ion C. Bratianu 2',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659650/banner-photo_cj1loi.jpg',
 'timisoara',
 '300001');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Espresso',
 'drinks',
 'Espresso preparat din 18-20 grame de boabe de espresso macinate fin si 1-2 uncii de apa fierbinte.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659648/photo-1664142638093-9a78da96c425_idzlir.avif',
 '60ml'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Chocolate Chunk Cinnamon Rolls',
 'pastry',
 'Rulouri cu scortisoara si bucati de ciocolata, preparate din lapte caldut, drojdie, zahar, ou, unt, faina si frosting de branza crema.',
 4.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659645/photo-1630921149042-54b46a1f045d_juz3eo.avif',
 '120g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'French Baguette',
 'pastry',
 'Baguette franceza, preparata din faina de grau, apa calda, sare si drojdie, cu crusta crocanta si miez moale.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659642/photo-1628697639527-e370a51de205_w1fy9e.avif',
 '250g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Fresh Orange Juice',
 'drinks',
 'Suc proaspat de portocale, preparat din 4-5 portocale, cu cuburi de gheata si un ram de menta.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659640/photo-1613478223719-2ab802602423_rh2a4z.avif',
 '300ml'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Cinnamon Rolls',
 'pastry',
 'Rulouri cu scortisoara, preparate din lapte caldut, drojdie, zahar, ou, unt, faina si glazura de zahar pudra.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659637/photo-1604349347491-630daad660ab_a3ia57.avif',
 '110g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Kanelbullar (Swedish Cinnamon Buns)',
 'pastry',
 'Chifle suedeze cu scortisoara, preparate din faina, drojdie, zahar, condimente, lapte caldut, unt si ou, umplute cu unt, zahar brun si scortisoara, presarate cu zahar perla.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659634/photo-1602077812176-1bd3ff433d74_vxxfvt.avif',
 '100g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Cortado',
 'drinks',
 'Cortado: 1 shot espresso combinat cu 1/2 uncie de lapte aburit.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659632/photo-1585671582673-66144d229f22_pxu11b.avif',
 '60ml'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Raisin Loaf Cake',
 'pastry',
 'Tort de paine cu stafide, preparat din faina, bicarbonat de sodiu, unt, zahar, oua, extract de vanilie, lapte bătut si stafide.',
 5.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659627/photo-1572897306051-abf270479682_gqvq6g.avif',
 '400g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'French Croissant',
 'pastry',
 'Croissant francez, preparat pentru o portie, din faina de grau, drojdie, zahar, sare, apa calda si unt rece cuburi.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659624/photo-1530610476181-d83430b64dcd_qm2gqp.avif',
 '80g'),

-- 10. Rustic Sourdough Breads (pastry)
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Rustic Sourdough Breads',
 'pastry',
 'Paine rustica cu maia, preparata din faina de grau, apa, maia activa, sare, seminte de floarea-soarelui si topping de cereale.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659619/photo-1509440159596-0249088772ff_od8n5f.avif',
 '300g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Roger''s Bakery'),
 'Chocolate Chip Cookies',
 'pastry',
 'Biscuiti cu bucati de ciocolata, preparati din unt, zahar, oua, faina, bicarbonat de sodiu, sare si ciocolata.',
 2.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659614/photo-1560910615-9eaa2e704e63_lsegjj.avif',
 '50g');


INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Sweet Loaves Bakery',
 'Strada Avram Iancu 7',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659723/banner-photo_pvxuxu.jpg',
 'timisoara',
 '300375');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Cinnamon Swirl Buns',
 'pastry',
 'Rulouri cu scortisoara, preparate din lapte caldut, drojdie, zahar, ou, unt si faina, cu umplutura de zahar brun si scortisoara si unt moale.',
 3.75,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659720/photo-1643188389404-5a10e50023bf_gnmfua.avif',
 '110g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Palmiers (Elephant Ears)',
 'pastry',
 'Palmiers, foi de aluat foietaj presarat cu zahar, copt pana devin crocante.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659762/photo-1595397351604-cf490cc38bf1_fmzbek.avif',
 '80g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Lemon Bars with Meringue',
 'pastry',
 'Batoane de lamaie cu meringa, preparate din faina, unt, zahar si suc de lamaie, cu topping de meringa.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659757/photo-1590005331377-bba80a5c0b0b_vs4bos.avif',
 '90g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Baguettes',
 'pastry',
 'Baguette frantuzeasca, preparata din faina, apa, sare, drojdie si ulei de masline, cu crusta crocanta.',
 2.80,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659754/photo-1588616279830-ef7fa0299348_chc8zm.avif',
 '250g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'French Macarons',
 'pastry',
 'Macarons francezi, preparati din faina de migdale, zahar pudra, albusuri si zahar granulat, in diverse culori si arome.',
 1.80,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659751/photo-1569864358642-9d1684040f43_ve2yvs.avif',
 '30g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Classic Vanilla Glazed Bundt Cake',
 'pastry',
 'Tort bundt cu glazura de vanilie, preparat din faina, unt, zahar, oua si lapte batut, cu un gust clasic si dulce.',
 4.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659748/photo-1564677156437-a37dfb30bbf6_ltctbp.avif',
 '400g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Strawberry White Chocolate Cupcakes',
 'pastry',
 'Cupcakes cu aroma de capsuni si ciocolata alba, preparate din mix de prajitura, topping batut, puree de capsuni si ciocolata alba topita.',
 3.75,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659745/photo-1563729784474-d77dbb933a9e_lneing.avif',
 '120g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Simple White Bread',
 'pastry',
 'Paine alba simpla, preparata din apa calda, drojdie, zahar, unt si faina, cu o textura pufoasa si crusta fina.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659742/photo-1533417177250-227597f5b264_sq0cmv.avif',
 '300g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Refreshing Lemonade',
 'drinks',
 'Limonada racoritoare, preparata din apa, zahar, suc de lamaie, frunze de menta si gheata.',
 3.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659739/photo-1507281549113-040fcfef650e_fzchlb.avif',
 '350ml'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Classic Chocolate Chip Cookies',
 'pastry',
 'Biscuiti clasici cu bucati de ciocolata, preparati din unt, zahar, oua, faina, bicarbonat si ciocolata, cu o textura crocanta.',
 2.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659733/photo-1558961363-fa8fdf82db35_ll8hfv.avif',
 '50g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Belgian Waffles',
 'pastry',
 'Wafele belgiene, preparate din faina, lapte, oua, unt si vanilie, crocante la exterior si pufoase la interior.',
 4.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659731/photo-1558584724-0e4d32ca55a4_si5l6u.avif',
 '150g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Assorted Bread Rolls',
 'pastry',
 'Chifle asortate, preparate din faina, apa, zahar, drojdie, sare, ulei si seminte, cu o crusta aurie si textura pufoasa.',
 2.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659728/photo-1549438247-223f2db1dd29_sbzcwz.avif',
 '70g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Sweet Loaves Bakery'),
 'Herb and Seed Sourdough Bread',
 'pastry',
 'Paine cu maia, aromata cu ierburi si seminte, preparata din faina de grau, faina integrala, apa, maia activa, sare, ierburi si seminte mixte.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659725/photo-1547978059-2639fd612c66_qmdbdf.avif',
 '350g');

