SELECT * FROM restaurants;
SELECT * FROM categories;

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Fantastic Fettuccine Feast',
'Strada Enrico Caruso 1',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659450/banner-photo_ivwlpr.jpg',
'timisoara',
'300003');

-- Inserare produse
INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Spaghetti with Bolognese Sauce and Olives',
 'pasta',
 'Spaghetti gatit cu sos bolognese, preparat cu carne tocata de vita, ceapa, usturoi, rosii zdrobite si sos de rosii, aromatizat cu oregano, busuioc, masline Kalamata si parmesan.',
 22.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659447/photo-1598504775866-e842291dbe10_i3tzun.avif',
 '450g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Pesto Pasta with Roasted Cherry Tomatoes',
 'pasta',
 'Pasta cu pesto si rosii cherry coapte, preparata cu spaghetti, pesto, rosii cherry, seminte de pin, usturoi si parmesan, asezonata cu sare si piper.',
 20.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659445/photo-1593253500499-50e579a5733f_umeoct.avif',
 '400g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Spaghetti with Meatballs',
 'pasta',
 'Spaghetti cu chiftele, preparat cu carne tocata, pesmet, parmesan, ou, patrunjel si condimente, intr-un sos marinara servit peste spaghetti aburind.',
 23.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659439/photo-1589227365533-cee630bd59bd_hmxykf.avif',
 '420g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Tagliatelle al Ragu',
 'pasta',
 'Tagliatelle cu ragu, preparat cu carne tocata de vita, ceapa, usturoi, rosii zdrobite, sos de rosii, vin rosu, oregano si busuioc, garnisit cu parmesan.',
 24.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659437/photo-1579684947550-22e945225d9a_ie5rus.avif',
 '400g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Simple Spaghetti with Meat Sauce',
 'pasta',
 'Spaghetti simplu cu sos de carne, preparat cu carne tocata, ceapa, usturoi, rosii zdrobite si sos de rosii, aromatizat cu oregano si busuioc, servit peste spaghetti.',
 21.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659434/photo-1572441713132-c542fc4fe282_rumwnt.avif',
 '430g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Lemon Garlic Pasta',
 'pasta',
 'Pasta cu lamaie si usturoi, preparata cu pappardelle, usturoi, ulei de masline, suc de lamaie, parmesan si patrunjel, asezonata cu sare si piper.',
 19.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659432/photo-1571777663262-fcc9e6076644_tmvylc.avif',
 '380g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Simple Spaghetti with Tomato Sauce and Cheese',
 'pasta',
 'Spaghetti simplu cu sos de rosii si branza, preparat cu spaghetti, sos de rosii, mozzarella si patrunjel, asezonat cu sare si piper.',
 20.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659430/photo-1571175534150-72cd2b5a6039_fgbhi4.avif',
 '410g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Pesto Spaghetti with Burrata',
 'pasta',
 'Spaghetti cu pesto si burrata, preparat cu spaghetti, pesto, burrata, parmesan si busuioc, oferind o combinatie cremoasa si aromata.',
 25.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659428/photo-1567608285969-48e4bbe0d399_poeizi.avif',
 '400g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Shrimp Scampi with Spaghetti and Cherry Tomatoes',
 'pasta',
 'Spaghetti cu creveti scampi si rosii cherry, preparat cu creveti, rosii cherry, usturoi, ulei de masline, unt, vin alb, patrunjel si ceapa verde.',
 26.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659426/photo-1563379926898-05f4575a45d8_bbrpxn.avif',
 '450g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Pasta with Sausage, Spinach, and Cheese',
 'pasta',
 'Pasta cu carnati, spanac si branza, preparata cu penne, carnati italieni, spanac proaspat, mozzarella si usturoi, asezonata cu ulei de masline si condimente.',
 22.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659424/photo-1529042355636-0f06afe127a9_rrtc52.avif',
 '420g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Spaghetti with Bacon, Fava Beans, and Garlic',
 'pasta',
 'Spaghetti cu bacon, fasole fava si usturoi, preparat cu spaghetti, bacon crocant, fasole fava, usturoi, ulei de masline si rucola proaspata.',
 23.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659422/photo-1527763944526-4e4139854bbc_yqzq5s.avif',
 '400g'),

-- 12
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Pesto Pasta Salad with Cherry Tomatoes',
 'pasta',
 'Salata de pasta cu pesto si rosii cherry, preparata cu farfalle, pesto, rosii cherry si verdeata mixta, asezonata cu sare si piper.',
 18.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659418/photo-1473093295043-cdd812d0e601_m80vir.avif',
 '350g'),

-- 13
((SELECT id FROM restaurants WHERE name = 'Fantastic Fettuccine Feast'),
 'Creamy Mushroom and Sage Pappardelle',
 'pasta',
 'Pappardelle cremoase cu ciuperci si salvie, preparate cu pappardelle, ciuperci cremini, salvie, smantana, parmesan, ulei de masline, sare si piper.',
 27.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659416/photo-1473093226795-af9932fe5856_vvd9rz.avif',
 '430g');

INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Perfect Pasta Paradiso',
'Strada Episcop Augustin Pacha 3',
'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659518/banner-photo_ayhmet.jpg',
'timisoara',
'300055');

-- Inserare restaurant
INSERT INTO restaurants (name, street_address, image, city, postal_code)
VALUES
('Perfect Pasta Paradiso',
 'Strada Gustului 12',
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659550/pasta-banner.jpg',
 'cluj-napoca',
 '400001');

-- Inserare produse
INSERT INTO products (restaurant_id, name, category_name, description, price_per_item, image, weight) VALUES
-- 1
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Classic Lasagna',
 'pasta',
 'Lasagna clasica cu carne tocata de vita, ceapa, usturoi, rosii zdrobite, sos de rosii, condimente, foi de lasagna, ricotta, parmesan si ou, garnisita cu busuioc proaspat.',
 26.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659525/lasagna_qlxpxo.avif',
 '550g'),

-- 2
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Spaghetti Bolognese',
 'pasta',
 'Spaghetti Bolognese, preparat cu carne tocata de vita, ceapa, usturoi, rosii zdrobite si sos de rosii, aromatizat cu oregano si busuioc, completat cu parmesan.',
 24.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659522/bolognese_lfevzx.avif',
 '500g'),

-- 3
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Fettuccine with Roasted Red Peppers and Olives',
 'pasta',
 'Fettuccine cu ardei rosu copt si masline, preparat cu fettuccine, ulei de masline, ardei rosu copt, masline Kalamata, patrunjel proaspat si sos marinara.',
 23.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659516/abhishek-hajare-_3dTLrMwiW8-unsplash_rn1hcp.avif',
 '450g'),

-- 4
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Creamy Mushroom and Chicken Penne Pasta',
 'pasta',
 'Penne cu pui si ciuperci in sos cremos, preparat cu penne, carne de pui, ciuperci cremini, unt, faina, supa de pui, smantana si parmesan, asezonat cu cimbru.',
 25.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659514/photo-1612152328178-4a6c83d96429_hm7yif.avif',
 '500g'),

-- 5
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Pappardelle with Bolognese Sauce',
 'pasta',
 'Pappardelle cu sos bolognese, preparat cu pappardelle, carne tocata de vita, ceapa, morcovi, telina, vin rosu, rosii zdrobite, sos de rosii, condimente si parmesan.',
 27.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659512/photo-1611270629569-8b357cb88da9_uhgqgw.avif',
 '550g'),

-- 6
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Spaghetti Carbonara',
 'pasta',
 'Spaghetti Carbonara, preparat cu spaghetti, guanciale sau pancetta, oua, Pecorino Romano, piper proaspat macinat si sare, obtinandu-se un sos cremos si savuros.',
 22.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659509/photo-1608756687911-aa1599ab3bd9_rpksc8.avif',
 '400g'),

-- 7
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Spicy Shrimp Spaghetti',
 'pasta',
 'Spaghetti picant cu creveti, preparat cu spaghetti, creveti, usturoi, ulei de masline, ardei rosu si ceapa verde, condimentat cu sos chili si completat cu parmesan.',
 26.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659507/photo-1608334481162-bba440193a20_tigqva.avif',
 '450g'),

-- 8
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Creamy Chicken and Mushroom Pasta',
 'pasta',
 'Fettuccine cu pui si ciuperci in sos cremos, preparat cu fettuccine, carne de pui, ciuperci cremini, usturoi, smantana, parmesan, unt si patrunjel proaspat.',
 25.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659505/photo-1608219992759-8d74ed8d76eb_i91vhz.avif',
 '500g'),

-- 9
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Chicken Pesto Pasta',
 'pasta',
 'Fettuccine cu pui si pesto, preparat cu fettuccine, carne de pui, sos pesto, parmesan si ulei de masline, asezonat cu sare si piper.',
 24.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659503/photo-1560788784-66eda82b5eb7_vyncav.avif',
 '480g'),

-- 10
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Spaghetti Aglio e Olio with Pancetta',
 'pasta',
 'Spaghetti Aglio e Olio cu pancetta, preparat cu spaghetti, pancetta, usturoi, ulei de masline extra virgin, patrunjel proaspat si parmesan, asezonat cu sare si piper.',
 21.50,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659498/photo-1552056776-9b5657118ca4_vr02yw.avif',
 '420g'),

-- 11
((SELECT id FROM restaurants WHERE name = 'Perfect Pasta Paradiso'),
 'Creamy Steak and Mushroom Fettuccine',
 'pasta',
 'Fettuccine cu carne de vita si ciuperci in sos cremos, preparat cu fettuccine, carne de vita, ceapa, ciuperci cremini, usturoi, smantana, parmesan, rosii uscate si spanac, obtinand o combinatie bogata si aromata.',
 28.00,
 'https://res.cloudinary.com/dgrxgnab1/image/upload/v1742659486/photo-1551183053-bf91a1d81141_h2m075.avif',
 '550g');
