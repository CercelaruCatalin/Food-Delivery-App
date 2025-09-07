SELECT * FROM restaurants;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Fantastic Noodles House',
'Strada Enrico Caruso 3',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659306/banner-photo_xnkr7l.avif',
'timisoara',
'300001');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Udon cu vita picanta si sos de tocana',
 'noodles',
 'Vita gatita lent, taitei udon, sos de soia, vin de orez, zahar brun si condimente aromatice pentru o aroma intensa si picanta.',
 24.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659305/photo-1659948754009-7cd47619a550_l7depp.avif',
 '400g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Taietei fierbinti cu verdeata',
 'noodles',
 'Taietei fierti preparati cu ulei vegetal, usturoi si ghimbir, imbogatiti cu verdeata proaspata si sos de soia pentru un preparat reconfortant.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659304/photo-1635685296916-95acaf58471f_xaavon.avif',
 '350g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Lo Mein cu bok choy si broccoli',
 'noodles',
 'Taitei de ou prajiti, combinati cu broccoli, bok choy si morcovi, intr-un sos de soia si sos de stridii pentru o aroma autentica chineza.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659302/photo-1634864572865-1cf8ff8bd23d_ccdbjs.avif',
 '380g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Supa de taitei cu vita si legume',
 'noodles',
 'Supa consistenta cu taitei de orez, felii subtiri de vita, zucchini, ardei rosu si praz, aromata cu sos de soia, otet de orez si coriandru proaspat.',
 19.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659301/photo-1631709497146-a239ef373cf1_qd2irc.avif',
 '420g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Taitei shirataki stir-fry picant',
 'noodles',
 'Taitei shirataki combinate cu cuburi de piept de pui, zucchini si sos intens cu sriracha, ulei de susan si miere, completat cu ghimbir si usturoi proaspat.',
 21.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659299/photo-1626804475297-41608ea09aeb_agkpe2.avif',
 '360g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Bol de taitei cu ciuperci si legume',
 'noodles',
 'Spaghete integrale combinate cu ciuperci cremini, ceapa galbena, usturoi si o garnitura de castravete, ceapa rosie si morcovi pentru un preparat echilibrat si aromat.',
 22.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659298/photo-1619371042685-827b1c646923_ux9pdv.avif',
 '400g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Lo Mein cu vita si legume',
 'noodles',
 'Taitei de ou combinati cu felii subtiri de vita, ceapa, morcovi, broccoli si oua, intr-un sos savuros de soia si condimente delicate.',
 23.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659296/photo-1615750856719-9b7f225e9273_wpeoaz.avif',
 '410g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Supa de taitei cu vita la tocana',
 'noodles',
 'Vita gatita lent, taitei de ou si ceapa verde intr-o supa bogata de vita, aromata cu sos de soia si o nota de ghimbir, garnisita cu seminte de susan.',
 24.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659313/photo-1614649672633-cb78b332a9a9_yuys7o.avif',
 '430g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Bol de taitei picant',
 'noodles',
 'Taitei cu un plus de condimente, serviti cu ou fiert, ceapa verde si chili pentru o explozie de arome intense si un gust inconfundabil.',
 17.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659311/photo-1612927601601-6638404737ce_vzyml5.avif',
 '300g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Lo Mein vegetal',
 'noodles',
 'Taitei de ou prajiti cu legume proaspete: ceapa, ardei, morcovi si broccoli, intr-un sos de soia si sos de stridii pentru o optiune gustoasa si echilibrata.',
 18.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659309/photo-1585032226651-759b368d7246_wdyu0m.avif',
 '370g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Fantastic Noodles House'),
 'Bol asiatic de taitei',
 'noodles',
 'Taitei de grau cu morcovi, castraveti, ciuperci, bastoane de crab imitatie si ou fiert, asezonati cu sos asiatic pentru un preparat usor si savuros.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659308/photo-1552611052-33e04de081de_k7o4y8.avif',
 '320g');


INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Top Noodle Court',
'Strada Aristide Demetriade 1',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659348/banner-photo_bvtwmn.jpg',
'timisoara',
'300088');

INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Taitei prajiti cu porc si legume',
 'noodles',
 'Taitei prajiti cu porc si legume, preparati cu taitei de ou, porc feliat subtire, ardei verde si rosu, ceapa alba si usturoi, asezonati cu sos de soia, sos de stridii si ulei de susan.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659346/photo-1607328874071-45a9cd600644_vx2ibp.avif',
 '350g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Spicy Miso Ramen',
 'noodles',
 'Ramen picant cu miso, preparat cu un pachet de taitei ramen, supa picanta de miso, carne macinata de pui sau porc, porumb dulce, doua oua moi taiate, bok choy, ceapa verde si verdeata amestecata, presarat cu seminte de susan.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659344/photo-1591814468924-caf88d1232e1_ilfiv0.avif',
 '320g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Spicy Ramen cu ou si bacon',
 'noodles',
 'Ramen picant cu ou si bacon, preparat cu un pachet de taitei ramen, doua oua fierte tari taiate in jumatate, bacon feliat, ceapa verde, nuci, stafide si seminte de dovleac.',
 19.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659342/photo-1588001291548-948f55922bfd_yenrgd.avif',
 '300g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Ramen cu creveti, oua moi si mazare chinezeasca',
 'noodles',
 'Ramen cu creveti, oua moi si mazare chinezeasca, preparat cu un pachet de taitei ramen, o cana de creveti decojiti, o cana de mazare chinezeasca, doua oua mari, sos de soia, ulei de susan si ceapa verde.',
 23.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659341/photo-1569718212165-3a8278d5f624_tuuf0e.avif',
 '360g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Supa de taitei cu vita si kale',
 'noodles',
 'Supa de taitei cu vita si kale, preparata cu vita feliata subtire, taitei uscate, kale, morcovi, ceapa verde, ardei iute, supa de vita, sos de soia, ulei de susan si ghimbir.',
 22.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659339/photo-1565628308934-c731959645f2_gutwr4.avif',
 '400g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Simple Ramen',
 'noodles',
 'Ramen simplu, preparat cu supa de pui sau legume, taitei ramen, felii subtiri de porc, ou moale fiert si ceapa verde, asezonat cu sos de soia.',
 16.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659336/photo-1527027556693-f5381a7c77bf_lf4d6g.avif',
 '280g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Shoyu Ramen',
 'noodles',
 'Ramen Shoyu, preparat cu taitei ramen, supa pe baza de sos de soia, carne de porc chashu, ou moale, narutomaki, germeni de fasole, bok choy, ceapa verde si legume proaspete.',
 21.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659334/photo-1509680859026-7d8cfc6894f4_d6mdgb.avif',
 '350g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Supa de taitei cu picior de porc',
 'noodles',
 'Supa robusta cu picior de porc, preparata cu picior de porc curatat, taitei de ou, supa de pui, catei de usturoi, ceapa verde, sos de soia, vin de orez si ghimbir, asezonata cu sare si piper.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659333/photo-1504669221159-56caf7b07f57_qhncas.avif',
 '450g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Laksa Lemak',
 'noodles',
 'Laksa Lemak, preparat cu ulei vegetal, ceapa, usturoi, ghimbir, lemongrass, foi de lime, chili, lapte de cocos, supa de pui sau legume, sos de peste, pasta de tamarind, zahar, taitei de ou, tofu, carne de pui sau creveti optional, germeni de fasole si fasole lunga, garnisit cu ceapa prajita si sambal.',
 24.99,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659355/photo-1491961865842-98f7befd1a60_daqevw.avif',
 '500g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Top Noodle Court'),
 'Vietnamese Chicken Noodle Soup (Bun Ga)',
 'noodles',
 'Bun Ga vietnamez, supa aromata cu taitei de orez, piept de pui fara piele, supa de pui, ceapa subtire, usturoi, ghimbir, sos de peste, sos de soia, zahar brun, otet de orez, chili, germeni de fasole, coriandru, ceapa verde si lime.',
 19.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659353/photo-1555126634-323283e090fa_tszpg5.avif',
 '380g');
