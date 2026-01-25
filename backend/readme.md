# LA DESPENSA COMÚN - BACKEND


### 0. Presentación

DespensaComun es una red de trueque y donación entre personas que cultivan en casa pequeñas cantidades de frutas y hortalizas u otros recursos. 

Como práctica, abarca el desarrollo backend con MongoDB, Mongoose, Express y controladores RESTful enlazado a un frontend hecho con React.

El objetivo de este proyecto es realizar una prueba completa de aplicación web funcional para posteriormente probarla en un entorno real y localizado en prueblos de la Sierra de Guadarrama.



### 1.Estructura del proyecto

backend/
│
├── seeds/      · Archivos CSV de los que parte el seed -> groups, products y users.
│                   El resto de colecciones (conversations, favorites, messages y transactions 
│                   se rellenan automáticamente).
│               · seed_csv.js.
│
│
│
├── src/
│   ├── api/v1/
│   │           ├── controllers/     # Controladores para las rutas│   │
│   │           ├── models/          # Modelos Mongoose ()
│   │           ├── routes/          # Definición de rutas Express
|   |
|   |
|   |
│   ├── config/              # Configuración de Cloudinary, conexión a Mongo Atlas y gestión del token de auth.
|   |
│   ├── middlewares/         # Middlewares como autenticación de usuario y administrador y subida de imágenes.
|   |
│   └── utils/               # Script de borrado de imágenes en Cloudinary.
│
│
│
├── .index.js                    
├── .env                    
├── .gitignore
├── package.json
├── README.md                # Documentación




### 2. Instalación y Ejecución del Proyecto

        git clone XXXXXXXXXXX

- ### Instalar dependencias

        npm install


- ### Configurar el entorno

    El archivo .env en la raíz incluye las variables de entorno para la versión de entrega de proyecto.

        PORT
        DB_URL

        JWT_SECRET
        JWT_EXPIRES_IN

        BCRYPT_SALT_ROUNDS

        CLOUDINARY_API_KEY
        CLOUDINARY_API_SECRET
        CLOUDINARY_CLOUD_NAME
        CLOUDINARY_URL



### Scripts en package.json para la ejecución del servidor y del seed

        "start": "node index.js",
        "dev": "nodemon index.js",
        "seed": "node seeds/seed_csv.js"


## 3. Endpoints definidos:

Las rutas están divididas de acuerdo con las seis colecciones implicadas en el funcionamiento de la aplicación:

    · groups        Comunidades con lógica de moderación, solicitudes de unión y miembros.
    · messages      Mensajes de grupo o privados gestionada con conversations.
    · products      Catálogo de productos con ubicación, categoría (Donación/Intercambio) y stock.
    · users         Gestión de perfiles, roles (admin/ user) y favoritos.

    · favorites     Favoritos marcados por cada usuario (de tipo group, product o user).
    · transactions  Cada operación de trueque o donación entre dos usuarios.
    · conversations - auxiliar de messages, groups y users.


###  TABLA DE RUTAS


CONVERSACIONES

get         "/user/:userId"             Auth SÍ         getUserChats
post        "/with/:otherUserId"        Auth SÍ         getOrCreateConversation
get         "/:id"                      Auth SÍ         getConversationById


FAVORITOS

post        "/"                         AutH SÍ         toggleFavorite
get         "/"                         AutH SÍ         getMyFavorites
get         "/check/:id"                AutH SÍ         checkFavoriteStatus
delete      "/:id"                      AutH SÍ         toggleFavorite


GRUPOS

post        "/"                         AutH SÍ         createGroup
get         "/"                         AutH SÍ         getAllGroups
get         "/:id"                      AutH SÍ         getGroupById
get         "/user/:id"                 AutH SÍ         getUserGroups
put         "/:id"                      AutH SÍ         updateGroup
delete      "/:id"                      AutH SÍ         deleteGroup
post        "/:id/request"              AutH SÍ         requestToJoinGroup
ost         "/:id/approve/:userId"      Auth SÍ         approveJoinRequest
elete       "/:id/reject/:userId"       AutH SÍ         rejectJoinRequest
patch       "/:id/role/:userId"         AutH SÍ         changeToModerator
delete      "/:id/member/:userId"       AutH SÍ         removeMember
post        "/:id/leave"                AutH SÍ         leaveGroup


PRODUCTOS

post        "/"                         AutH SÍ         uploadImage, uploadToCloudinary, createProduct
get         "/",                        NO              getAllProducts
get         "/my-inventory"             AutH SÍ         getUserProducts
get         "/user/:userId"             AutH SÍ         getUserProducts
get         "/:id"                      AutH SÍ         getProductById
put         "/:id"                      AutH SÍ         uploadImage, uploadToCloudinary, updateProduct
delete      "/:id"                      AutH SÍ         deleteProduct


TRANSACCIONES

post        "/"                         AutH SÍ         createTransaction
get         "/my-transactions"          AutH SÍ         getUserTransactions
get         "/user-feedback/:userId"    AutH SÍ         getFeedbackByUserId
post        "/:id/messages"             AutH SÍ         addMessageToTransaction
post        "/:id/feedback"             AutH SÍ         addFeedback


USUARIOS

post        "/register"                 NO              uploadImage, uploadToCloudinary, registerUser
post        "/login"                    NO              loginUser
get         "/"                         AutH SÍ         getAllUsers
get         "/:id"                      AutH SÍ         getUserById
put         "/:id"                      AutH SÍ         uploadImage, uploadToCloudinary, updateUser
delete      "/:id"                      AutH SÍ         deleteUser


## 4. Autenticación

La mayoría de las rutas requieren un token JWT en el encabezado:

    Authorization: Bearer <token>
    El token se genera al iniciar sesión con un usuario registrado mediante POST /auth/login.


## 5. Tecnologías y librerías utilizadas

-    Node.js y Express
-    MongoDB con Mongoose
-    JWT
-    bcrypt
-    dotenv
-    nodemon
-    cors
-    csv-parser
-    jsonwebtoken
-    multer
-    streamifier
-    FS (seed)



## 5. Autor

Carlos Campillo Matías.
Entrega de Proyecto Final. {RTC - Desarrollo Web}.
Enero de 2026