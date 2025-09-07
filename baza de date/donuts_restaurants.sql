SELECT * FROM restaurants;
SELECT * FROM products;


INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Robert''s Donuts',
'Bulevardul Ion C. Bratianu 2',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566477/banner-photo_czqucq.avif',
'timisoara',
'300001');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu zahar glazurat',
 'donuts',
 'Gogosi pufoase acoperite cu glazura de zahar pentru un gust dulce si crocant.',
 7.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566477/photo-1729956223073-6439d1f9e558_nmujt8.avif',
 '90g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi glazurate',
 'donuts',
 'Gogosi prajite, pufoase si acoperite cu glazura fina de vanilie.',
 7.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566476/photo-1709188866085-923eb283a55a_zjrmbi.avif',
 '90g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu Oreo',
 'donuts',
 'Gogosi cu glazura de ciocolata si bucati crocante de biscuiti Oreo.',
 8.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566475/photo-1685779923868-3b8efb401b98_gktgot.avif',
 '100g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu bombonele colorate',
 'donuts',
 'Gogosi pufoase prajite si decorate cu glazura dulce si bombonele colorate.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566474/photo-1654736092502-e3e45d741469_auggmt.avif',
 '100g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi pufoase cu crema si bombonele roz',
 'donuts',
 'Gogosi umplute cu frisca si decorate cu glazura roz si bombonele dulci.',
 10.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566474/photo-1649035570125-fc9c965cc51c_iilcei.avif',
 '110g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi berlineze cu gem',
 'donuts',
 'Gogosi in stil berlinez, prajite, umplute cu gem si presarate cu zahar pudra.',
 9.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566473/photo-1611762689912-26a445785dec_p511xh.avif',
 '120g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi roz cu bombonele',
 'donuts',
 'Gogosi pufoase decorate cu glazura roz si bombonele albe crocante.',
 8.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566483/photo-1533910534207-90f31029a78e_wvc3h3.avif',
 '90g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu glazura de lavanda',
 'donuts',
 'Gogosi prajite si acoperite cu glazura aromata de lavanda si bombonele colorate.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566480/photo-1516918977792-f0f8948aa15a_s5oap7.avif',
 '100g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu ciocolata si bombonele',
 'donuts',
 'Trio de gogosi acoperite cu glazura de ciocolata si bombonele colorate.',
 11.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566479/photo-1551024601-bec78aea704b_fvkldx.avif',
 '150g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Gogosi cu biscuiti si crema',
 'donuts',
 'Gogosi cu aluat de ciocolata, glazura de ciocolata alba si bucati de Oreo crocante.',
 10.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566478/photo-1533136872-c5d7b7b800ae_vzekjo.avif',
 '110g'),

-- 11
 ((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Espresso',
 'drinks',
 'Cafea concentrata preparata cu 7g de boabe macinate fin si 30ml de apa fierbinte.',
 6.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742568363/photo-1612183515105-8c737ba7585d_raikgp.avif',
 '30ml'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Cafea cu lapte',
 'drinks',
 'Cafea aromata preparata din boabe proaspat macinate si lapte fierbinte.',
 8.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742568361/photo-1579992357154-faf4bde95b3d_epfz9t.avif',
 '200ml'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Robert''s Donuts'),
 'Latte',
 'drinks',
 'Cafea cu un shot de espresso, lapte aburit si spuma fina de lapte.',
 9.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742568365/photo-1561882468-9110e03e0f78_n8wlht.avif',
 '250ml');
 

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Hummingbird Donuts',
'Strada Cluj',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566508/banner-photo_wq5aa8.avif',
'timisoara',
'300579');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi umplute cu gem (Berliner Pfannkuchen)', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Aluat pufos prajit, umplut cu gem si pudrat cu zahar', 
 14.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566507/photo-1612987923692-2e8d3d298f88_tirnle.avif',
 '120g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi cu dungi portocalii', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi glazurate decorate cu glazura portocalie', 
 13.49, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566506/photo-1609873539099-ad08ff472f65_fkffyn.avif',
 '110g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Beignets', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi prajite pudrate cu zahar, cu textura usoara si pufoasa', 
 15.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566505/photo-1589199750869-334ae4187406_du9zsi.avif',
 '140g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi roz cu bombonele', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi glazurate roz, decorate cu bombonele colorate', 
 12.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566504/photo-1582232655383-0826ba4f1347_fjqcku.avif',
 '115g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi cu ciocolata si bombonele', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi glazurate cu ciocolata si decor cu bombonele de ciocolata', 
 14.49, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566503/photo-1579761408737-9f6853b68e30_zs0nc6.avif',
 '130g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi cu zahar pudra', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi clasice pudrate cu zahar fin', 
 11.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566502/photo-1578257264874-5a9858af7d68_l3nuhc.avif',
 '120g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi glazurate cu ciocolata si migdale', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi pufoase cu glazura de ciocolata si topping de migdale', 
 15.49, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566501/photo-1576021220401-9f1453159c62_xearxp.avif',
 '135g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 '2 gogosi cu bombonele', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Una cu glazura de ciocolata si una cu zahar si lapte, decorate cu bombonele', 
 16.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566500/photo-1530016555861-3d1f3f5ca94b_jvwhqj.avif',
 '200g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi glazurate', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi pufoase cu glazura dulce clasica', 
 13.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566513/photo-1514517220017-8ce97a34a7b6_lhzq8n.avif',
 '120g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Gogosi glazurate cu nuci', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 'Gogosi cu glazura alba si topping crocant de nuci tocate', 
 15.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566512/photo-1472452049192-db15def0be25_cifn1u.avif',
 '130g'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Turn cu gogosi roz si bombonele', 
 (SELECT name FROM categories WHERE name = 'donuts'), 
 '4 gogosi glazurate cu roz si decor de bombonele colorate', 
 22.99, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742566511/photo-1464347477106-7648bc26261b_fkzuy1.avif',
 '250g');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Latte', 
 (SELECT name FROM categories WHERE name = 'drinks'), 
 'Cafea espresso cu lapte aburit', 
 11.50, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742569110/photo-1489866492941-15d60bdaa7e0_uaqxpe.avif',
 '250ml'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Espresso', 
 (SELECT name FROM categories WHERE name = 'drinks'), 
 'Cafea tare preparata din boabe fin macinate', 
 8.00, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742569115/photo-1558416165-5fb04b79b0e7_xlthfv.avif',
 '50ml'),

((SELECT id FROM restaurants WHERE name = 'Hummingbird Donuts'), 
 'Suc de portocale cu lamaie', 
 (SELECT name FROM categories WHERE name = 'drinks'), 
 'Suc natural proaspat stors din portocale si lamaie', 
 9.50, 
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742569112/Fresh_Orange_Juice_with_Lemon_Garnish_dgf3vc.avif',
 '300ml');

