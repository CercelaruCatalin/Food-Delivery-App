SELECT * FROM restaurants;
SELECT * FROM products;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Yarın Kebab Restaurant',
 'Strada Bujorilor 2',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660237/banner-photo_styhy7.jpg',
 'timisoara',
 '300446');

 INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Grilled Chicken and Vegetable Skewers',
 'kebab',
 'Frigarui de pui la gratar cu legume, preparate din cuburi de pui, ardei rosu, ceapa rosie si zucchini, asezonate cu ulei, sare, piper, usturoi si paprika.',
 12.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660228/z-grills-australia-jkP5KFVbpGg-unsplash_dhki81.avif',
 '350g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Shawarma Pita',
 'kebab',
 'Pita cu shawarma, umpluta cu carne de miel feliata subtire, patrunjel, ceapa rosie si rosii, stropita cu suc de lamaie.',
 10.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660295/yoad-shejtman-sPmF7MNzdnU-unsplash_lsjtku.avif',
 '300g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Turkish Adana Kebab with Sides',
 'kebab',
 'Kebab turcesc Adana, preparat din carne de miel tocata, ceapa, ardei iute si condimente, servit cu pita, bulgur, ceapa murata si sos de iaurt.',
 14.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660289/vitaly-mazur-1JSLIlFFvCY-unsplash_hgedvg.avif',
 '400g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Kebab Plate',
 'kebab',
 'Platou de kebab, cu carne feliata subtire, cartofi prajiti si salata mixta, servit cu sosuri albe si rosii.',
 13.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660285/sylwia-pietruszka-QhsXRA53FRs-unsplash_pulton.avif',
 '450g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Doner Kebab Wrap',
 'kebab',
 'Wrap cu doner kebab, umplut cu carne de doner, salata verde, varza si rosii, asezonat cu sos la alegere.',
 11.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660275/sylwia-pietruszka-dT7B3eul-Pk-unsplash_c6gbhr.avif',
 '350g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Lamb Kebab with Rice and Fries',
 'kebab',
 'Kebab de miel servit cu orez basmati si cartofi prajiti, preparat cu carne de miel, ceapa si condimente, insotit de felii de rosii si ardei.',
 15.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660270/nima-naseri-QoOCbD4eb8k-unsplash_dt3omy.avif',
 '500g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Lamb Seekh Kebabs and Tandoori Shrimp',
 'kebab',
 'Kebabs de miel si creveti tandoori, preparati cu carne de miel condimentata si creveti marinati in iaurt, serviti cu salata proaspata si legume.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660265/neil-robespierre-LXVbkJXsL7g-unsplash_vvmnhp.avif',
 '480g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Greek Pork Souvlaki with Fries and Pita',
 'kebab',
 'Souvlaki de porc grecesc, preparat din carne de porc marinata in oregano, servit cu cartofi prajiti, pita si legume proaspete.',
 14.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660261/markus-winkler-WHtVB-RiW2I-unsplash_lnrocy.avif',
 '420g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Pita',
 'kebab',
 'Paine pita traditionala, pufoasa si perfecta pentru a insoti kebabul.',
 3.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660257/jorge-fernandez-salas-56rFXPzUm1E-unsplash_wfkc7s.avif',
 '100g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Doner Kebab Sandwich',
 'kebab',
 'Sandwich cu doner kebab, umplut cu carne de doner, ceapa, varza rosie si rosii, servit in rulou moale.',
 11.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660241/doner_r2r1sw.avif',
 '350g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Yarın Kebab Restaurant'),
 'Gyro',
 'kebab',
 'Gyro, preparat cu carne de miel sau vita, servit in pita cu legume proaspete si sos tzatziki.',
 12.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742660233/anima-visual-jhTzMj5aJQk-unsplash_uq2knl.avif',
 '400g');
