-- Coordonatele sunt aproximative bazate pe adrese din Timisoara
SELECT * FROM RESTAuRANTS;

-- Robert's Donuts - Bulevardul Ion C. Bratianu 2
UPDATE restaurants 
SET latitude = 45.7577, longitude = 21.2270 
WHERE name = 'Robert''s Donuts';

-- Hummingbird Donuts - Strada Cluj
UPDATE restaurants 
SET latitude = 45.7542, longitude = 21.2165 
WHERE name = 'Hummingbird Donuts';

-- Grazie Ragazzi Pizza - Piața Alexandru Mocioni 7
UPDATE restaurants 
SET latitude = 45.7539, longitude = 21.2287 
WHERE name = 'Grazie Ragazzi Pizza';

-- The Pizza President - Piața Alexandru Mocioni 6
UPDATE restaurants 
SET latitude = 45.7540, longitude = 21.2285 
WHERE name = 'The Pizza President';

-- Yarın Kebab Restaurant - Strada Bujorilor 2
UPDATE restaurants 
SET latitude = 45.7612, longitude = 21.2433 
WHERE name = 'Yarın Kebab Restaurant';

-- Leaf & Crave - Strada Socrate 3
UPDATE restaurants 
SET latitude = 45.7565, longitude = 21.2195 
WHERE name = 'Leaf & Crave';

-- Super Fresh Bowls - Strada Socrate 1
UPDATE restaurants 
SET latitude = 45.7567, longitude = 21.2193 
WHERE name = 'Super Fresh Bowls';

-- The Comic Cappuccino - Strada Protopop George Dragomir 6
UPDATE restaurants 
SET latitude = 45.7483, longitude = 21.2298 
WHERE name = 'The Comic Cappuccino';

-- Sushi SoySmooth - Strada Marasesti 11
UPDATE restaurants 
SET latitude = 45.7601, longitude = 21.2178 
WHERE name = 'Sushi SoySmooth';

-- ZushiZa - Strada Marasesti 6
UPDATE restaurants 
SET latitude = 45.7598, longitude = 21.2175 
WHERE name = 'ZushiZa';

-- Roger's Bakery - Bulevardul Ion C. Bratianu 2
UPDATE restaurants 
SET latitude = 45.7577, longitude = 21.2270 
WHERE name = 'Roger''s Bakery';

-- Sweet Loaves Bakery - Strada Avram Iancu 7
UPDATE restaurants 
SET latitude = 45.7456, longitude = 21.2087 
WHERE name = 'Sweet Loaves Bakery';

-- Fantastic Fettuccine Feast - Strada Enrico Caruso 1
UPDATE restaurants 
SET latitude = 45.7634, longitude = 21.2345 
WHERE name = 'Fantastic Fettuccine Feast';

-- Perfect Pasta Paradiso - Strada Episcop Augustin Pacha 3
UPDATE restaurants 
SET latitude = 45.7521, longitude = 21.2156 
WHERE name = 'Perfect Pasta Paradiso';

-- Fantastic Noodles House - Strada Enrico Caruso 3
UPDATE restaurants 
SET latitude = 45.7632, longitude = 21.2347 
WHERE name = 'Fantastic Noodles House';

-- Top Noodle Court - Strada Aristide Demetriade 1
UPDATE restaurants 
SET latitude = 45.7489, longitude = 21.2143 
WHERE name = 'Top Noodle Court';

-- Bun & Sausage - Calea Circumvalatiunii 36
UPDATE restaurants 
SET latitude = 45.7389, longitude = 21.2534 
WHERE name = 'Bun & Sausage';

-- Mustard & Meat - Piata Unirii 5
UPDATE restaurants 
SET latitude = 45.7579, longitude = 21.2304 
WHERE name = 'Mustard & Meat';

-- Bold Cow Cookery - Strada Vasile Alecsandri 3
UPDATE restaurants 
SET latitude = 45.7498, longitude = 21.2287 
WHERE name = 'Bold Cow Cookery';

-- Love Pancakes - Bulevardul Dambovita 40
UPDATE restaurants 
SET latitude = 45.7234, longitude = 21.2156 
WHERE name = 'Love Pancakes';

-- Supreme Palm Tastes - Strada Lacul 1
UPDATE restaurants 
SET latitude = 45.7412, longitude = 21.2523 
WHERE name = 'Supreme Palm Tastes';

-- Robin-Provisions - Strada Marasesti 10
UPDATE restaurants 
SET latitude = 45.7581, longitude = 21.2260 
WHERE name = 'Robin-Provisions';

-- Purple-Lion - Strada Enrico Carusso 3
UPDATE restaurants 
SET latitude = 45.7480, longitude = 21.2145 
WHERE name = 'Purple-Lion';

-- Loyal Saucer Eater - Strada Clabucet 11
UPDATE restaurants 
SET latitude = 45.7620, longitude = 21.2380 
WHERE name = 'Loyal Saucer Eater';

-- Verifica rezultatele
SELECT name, street_address, latitude, longitude 
FROM restaurants 
ORDER BY name;

SELECT * FROM USERS;

UPDATE USERS
SET latitude = 45.73625669603468, longitude = 21.205131400213308
where email = 'shingen.catalin@gmail.com';