SELECT * FROM restaurants;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Bun & Sausage',
'Calea Circumvalatiunii 36',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659213/banner-photo_mjpub2.jpg',
'timisoara',
'300425');

INSERT INTO products (restaurant_id, category_name, name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog gourmet cu branza albastra si cartofi prajiti',
'2 chifle hot dog, 2 crenvursti, 60g branza albastra faramitata, 60g ceapa caramelizata, 2 linguri mustar, 120g fasole coapta, 30g salata verde tocata, 4 felii castraveti murati, ketchup, 2 linguri ulei de masline, 200g cartofi pai',
28.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659236/victoria-shes-8pK37xtN4bo-unsplash_vlgxsf.avif',
'450g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog clasic cu mustar, ketchup si ceapa verde',
'2 crenvursti, 2 chifle hot dog, ketchup, mustar, ceapa verde feliata, felii de lime',
19.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659238/ball-park-brand-lb5Ol3uTjUM-unsplash_jm8eqr.avif',
'300g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog gourmet cu cartofi prajiti',
'1 hot dog, 1 chifla hot dog, frunze de salata, maioneza, mustar, ketchup, 150g cartofi prajiti',
22.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659234/vaibhav-raina-NM4SbpNgvoc-unsplash_roy6sb.avif',
'350g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Chili cheese dog cu ceapa verde',
'1 hot dog, 1 chifla hot dog, 120g chili, 1 lingura maioneza, 1 lingura ceapa verde tocata',
24.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659234/photo-1721648373511-fb220d7f043f_oawyta.avif',
'320g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog Elote cu porumb si lime',
'2 hot dog, 2 felii paine toast, 200g boabe de porumb, 60g maioneza, 60g branza cotija, 60g pudra chili, felii de lime, 30g coriandru verde',
26.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659232/photo-1703080243677-00d841efa454_czoepg.avif',
'400g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Bratwurst cu mustar in chifla',
'2 carnati bratwurst, 2 chifle hot dog, 60g mustar galben',
23.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659231/photo-1695089028533-c6e9cf1ee3cb_wikijl.avif',
'300g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Banh Mi cu pulled pork',
'1 bagheta, 200g carne de porc maruntita, 60g maioneza, 60g sriracha, 60g legume murate (morcovi si ridiche daikon), 30g coriandru, 15g ardei iute jalapeno',
27.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659230/photo-1582254465498-6bc70419b607_yugwfs.avif',
'400g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog gourmet cu carnacior si toppinguri',
'1 carnacior la gratar, 1 chifla hot dog, 2 linguri maioneza, 2 linguri ketchup, 1 lingura ceapa murata tocata, 1 lingura relish',
21.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659229/photo-1524237629218-0a109277890c_fwff0v.avif',
'300g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Hot dog cu ceapa prajita si castraveti murati',
'1 hot dog (vita), 1 chifla hot dog, 60g ceapa prajita, 3 felii castraveti murati, maioneza',
20.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659251/chris-curry--imKpiFIBq4-unsplash_xjpw8z.avif',
'280g'),

((SELECT id FROM restaurants WHERE name = 'Bun & Sausage'), 'hot dog',
'Frikandel in chifla cu salata si sosuri',
'1 frikandel, 1 chifla lunga (tip Kaiser), maioneza, 30g ceapa rosie tocata, 30g ceapa verde tocata, 30g salata verde, felii de castraveti',
22.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659227/freunde-des-snacks-e-v-2CjxwgxAGsM-unsplash_bdju7n.avif',
'320g');




INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Mustard & Meat',
'Piata Unirii 5',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659239/banner-photo_lqinli.jpg',
'timisoara',
'300085');

INSERT INTO products (restaurant_id, category_name, name, description, price_per_item, image, weight)
VALUES
((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog cu ketchup si mustar',
'1 hot dog (vita), 1 chifla cu susan, ketchup, mustar',
9.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659203/jessica-loaiza-glqTtszXfM0-unsplash_sdcuiq.avif',
'160g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog cu carnacior italian si sos marinara',
'1 carnacior italian, 1 chifla hot dog, 60g sos marinara, 60g mozzarella rasa, 15g ardei gras verde, 15g ardei gras rosu, 15g masline verzi, 60g cartofi prajiti, sare, piper, ulei de masline',
15.50,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659212/yeh-xintong-7e54vTlsru0-unsplash_i8h8yy.avif',
'280g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog gourmet cu sos de branza',
'1 hot dog, 1 chifla hot dog, 2 linguri ketchup, 2 linguri maioneza, 2 linguri mustar, 60g jalapeno, 60g sos de branza topita',
13.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659211/ryan-concepcion-jMZGZ9FFZTU-unsplash_droaxf.avif',
'240g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog Coney Island',
'1 hot dog (vita), 1 chifla hot dog, 60g chili, 1 lingura mustar galben, chipsuri de cartofi',
12.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659211/ryan-concepcion-jMZGZ9FFZTU-unsplash_droaxf.avif',
'200g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Banh Mi vietnamez cu steak la gratar',
'2 baghete, 450g steak feliat subtire, 60ml sos de soia, 30ml sos de peste, 15g zahar brun, 15ml otet de orez, 5ml ulei de susan, 2g piper negru, 60g morcovi rasi, 60g castraveti julienne, 30g ceapa rosie feliata, 10g ardei iute rosu, 15g coriandru, maioneza (optional), seminte de susan',
26.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659210/photo-1675289057817-c9314ae75ca0_gwn9ob.avif',
'600g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog cu toppinguri incarcate',
'1 hot dog, 1 chifla hot dog, 2 linguri mustar galben, 2 linguri maioneza, 1 lingura relish, 1 lingura ceapa tocata, 1 lingura ketchup, cartofi prajiti',
13.50,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659208/photo-1641246630294-c48c8aec58fc_ganmlo.avif',
'250g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog Coney Island incarcat',
'1 hot dog (vita), 1 chifla hot dog, 1 lingura mustar galben, 1 lingura ketchup, 1 lingura maioneza, 60g rosii cuburi, 1 lingura patrunjel verde, 60g chili, 1 felie bacon crocant',
14.50,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659207/photo-1619740455993-9e612b1af08a_tqxgyz.avif',
'270g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog clasic cu relish si mustar',
'3 hot dog, 3 chifle hot dog, ketchup, mustar galben, relish dulce de castraveti',
21.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659206/photo-1612392061981-9d086fe894ed_wp9fvb.avif',
'480g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Chili cheese dog cu cartofi prajiti',
'1 hot dog, 1 chifla hot dog, ketchup, maioneza, 60g chili, 60g branza (rasa sau felii), 150g cartofi prajiti',
15.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659205/photo-1563567644743-81256d4aedca_uagkri.avif',
'320g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog gourmet',
'1 hot dog, 1 chifla hot dog, 2 linguri maioneza, 1 lingura mustar, 1 lingura ketchup, 60g rosii tocate, 1 lingura ceapa tocata',
12.50,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659205/photo-1541214113241-21578d2d9b62_wrjpqe.avif',
'210g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog cu carnati si legume',
'1 chifla hot dog, 2-3 carnati la gratar, frunze de salata, felii de rosii, jalapeno feliat, felii de castraveti murati, ketchup, mustar, seminte de susan, cartofi prajiti',
16.50,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659204/mr_wdh-PPwYBaC_g8M-unsplash_bmsctt.avif',
'340g'),

((SELECT id FROM restaurants WHERE name = 'Mustard & Meat'), 'hot dog',
'Hot dog cu relish',
'1 hot dog, 1 chifla hot dog, mustar, ketchup, relish',
10.00,
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659203/david-thielen-QHBBCyWwD4s-unsplash_hbyw0m.avif',
'180g');