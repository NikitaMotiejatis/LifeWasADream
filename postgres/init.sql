BEGIN TRANSACTION;

DROP TYPE IF EXISTS business_type CASCADE;
CREATE TYPE business_type AS ENUM('ORDER_BASED', 'APPOINTMENT_BASED');

DROP TABLE IF EXISTS business CASCADE;
CREATE TABLE business (
    id              INTEGER         PRIMARY KEY,
    name            VARCHAR(32)     NOT NULL,
    description     VARCHAR(1024)   NOT NULL,
    type            business_type   NOT NULL,
    email           VARCHAR(512)    NOT NULL,
    phone           VARCHAR(16)     NOT NULL,
    created_at      TIMESTAMP       NOT NULL
);


INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (1, 'Layo', 'In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.', 'ORDER_BASED', 'kcrickett0@cam.ac.uk', '506-139-8272', '2012-01-15 09:49:41');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (2, 'Realbuzz', 'Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.', 'ORDER_BASED', 'scromer1@sphinn.com', '236-510-0951', '2025-11-01 09:58:28');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (3, 'Meeveo', 'In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.', 'ORDER_BASED', 'nsterricker2@nationalgeographic.com', '204-107-2443', '2024-02-20 14:04:43');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (4, 'Thoughtsphere', 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.', 'APPOINTMENT_BASED', 'lgaywood3@cbslocal.com', '673-875-5895', '2017-09-25 01:26:41');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (5, 'Zava', 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.', 'APPOINTMENT_BASED', 'lcotter4@studiopress.com', '530-368-8393', '2010-10-27 16:46:23');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (6, 'Youfeed', 'Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.', 'ORDER_BASED', 'nclaworth5@scribd.com', '331-147-7669', '2023-05-30 18:16:57');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (7, 'Centimia', 'Phasellus in felis. Donec semper sapien a libero. Nam dui.', 'ORDER_BASED', 'wtrattles6@flickr.com', '957-729-4157', '2014-11-24 04:28:43');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (8, 'Feedfire', 'Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.', 'APPOINTMENT_BASED', 'atal7@google.es', '103-603-8369', '2018-06-08 12:37:25');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (9, 'Jabbercube', 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.', 'ORDER_BASED', 'dkettles8@is.gd', '639-903-8516', '2010-04-05 12:12:46');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (10, 'Photofeed', 'Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.', 'APPOINTMENT_BASED', 'lmotto9@addtoany.com', '465-424-8349', '2018-10-08 11:47:21');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (11, 'Yozio', 'Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.', 'APPOINTMENT_BASED', 'lvaughanhughesa@loc.gov', '853-662-4315', '2024-02-02 07:11:31');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (12, 'Livetube', 'Phasellus in felis. Donec semper sapien a libero. Nam dui.', 'ORDER_BASED', 'pblundinb@shareasale.com', '615-383-0827', '2024-10-25 21:45:49');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (13, 'Gigabox', 'In congue. Etiam justo. Etiam pretium iaculis justo.', 'ORDER_BASED', 'cmobiusc@biglobe.ne.jp', '144-184-9561', '2010-05-23 22:44:47');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (14, 'Avamba', 'In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.', 'ORDER_BASED', 'ctoobyd@cargocollective.com', '270-293-0586', '2011-08-21 06:35:15');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (15, 'Wikizz', 'Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.', 'ORDER_BASED', 'tcostaine@wordpress.org', '800-599-9844', '2015-09-23 14:45:16');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (16, 'Jazzy', 'Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.', 'ORDER_BASED', 'ihartinf@illinois.edu', '997-742-9695', '2022-05-18 18:09:20');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (17, 'Gevee', 'Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.', 'APPOINTMENT_BASED', 'tkingcottg@hud.gov', '952-706-1738', '2019-04-30 20:52:29');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (18, 'Gabcube', 'Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.', 'ORDER_BASED', 'mgealh@amazon.co.jp', '776-686-8508', '2025-02-20 03:04:30');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (19, 'Skyvu', 'Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.', 'ORDER_BASED', 'ashillingfordi@whitehouse.gov', '976-847-9498', '2012-01-18 11:15:42');
INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES (20, 'Kwilith', 'Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.', 'ORDER_BASED', 'ntiplingj@1und1.de', '516-246-3634', '2025-06-01 20:32:39');

COMMIT TRANSACTION;
