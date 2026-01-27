# La despensa común. Documentación Backend y Frontend



# despensacomun Frontend

https://despensa-comun.vercel.app





# LA DESPENSA COMÚN - FRONTEND


## 1.Estructura de PÁGINAS

### Welcome
    Es la página de acceso. Contiene el enlace a Home para acceder o crear una cuenta y un mapa de los productos que se encuentran publicados que, sólo en casa de que haya un usuario logueado, permitirán el acceso a la ficha de cada producto para poder conocer sus detalles o iniciar una transacción.
### Home
    Es donde se alojan los formularios de usuario: LoginForm, CreateUserForm o EditUserForm. En caso de no haber usuario logueado aparecerá el formulario de login con un link al de creación de usuario por si aún no ha sido creado (CreateUserForm tiene el link a login por si se trata de un usuario con cuenta creada que quiere acceder).
### OverView
    Una vez que se ha accedido a la plataforma, OverView ofrece información del usuario logueado, acceso a la edición del perfil o cierre de sesión y una serie de cards con información reducida sobre los productos, grupos, transacciones, valoraciones y, en el caso de los administradores, el listado de usuarios. Al pulsar sobre cualquiera de ellos navegamos a la página correspondiente que muestra la información extendida y el acceso a los detalles.
### Users (sólo para administradores)
    Presenta la barra de búsqueda de usuarios y el listado de los mismos.
### UserDetail
    Detalle de usuario con información del usuario, mapa con su ubicación, sus valoraciones y los botones para acceder al chat, o agregarlo a favoritos.
### Products
    Contiene un Card con los productos publicados por el usuario y el botón para publicar y otro con los publicados por otros usuarios. 
### ProductDetail
    Muestra la información del producto: categoría (intercambio o donación), estado, cantidad disponible, ubicación. También la información del productor y las acciones disponibles.
### Groups
    Contiene el Card de los grupos creados por el usuario y el de los grupos existentes creados por otros usuarios y que no sean grupos ocultos.
### GroupDetail
    Muestra un Card de información del grupo, el de sus miembros y el de las opciones. Para grupos de otros usuarios gestionamos desde aquí la opción de solicitar unirse o abandonar el grupo. Para los propios podemos acceder al formulario de edición del grupo (cambiar datos del grupo, convertirlo en privado si no queremos más miembros o eliminarlo). Desde esta página también podemos aceptar o rechazar solicitudos para unirse de otros usuarios.
### Favorites
    Contiene un Card de productos, otro de grupos y otro de usuarios que hayamos guardado como favoritos.
### Transactions
    Trueques. Es la página donde tenemos un Card con las solicitudes enviadas por otros usuarios para nuestros productos y otro con las que hemos enviado para intercambiar o pedir productos a otros usuarios. Desde aquí se pueden aceptar, rechazar, cancelar y valorar las distintas operaciones.
### NotFound
    Card que indica que se ha intentado acceder a una que no existe. La pera desorientada se explica por sí sola.
### ChatOverlay
    Es la página que muestra, en un componente flotante, el contenedor de los mensajes privados o chats grupales. Consta de un aside con los chats de grupos y otro con los mensajes directos, y de un contenedor principal donde se muestran la conversación y el input para escribir y enviar mensajes.



| Página          | Componenes                                                                                                 | Contexto + extra Hooks              | Admin? |
|:----------------|:-----------------------------------------------------------------------------------------------------------|-------------------------------------|--------:|
| ChatOverlay     |                                                                                                            | useLocation, createPortal           |         |
| Favorites       | Panel, Card, SetFavorite, ThumbNail, ChatSendMessageButton                                                 | AuthContext                         |         |
| GroupDetail     | Panel, Card, Button, GroupEditForm, Thumbnail, FavoriteSetButton, ChatSendMessageButton                    | AuthContext, useParams, useNavigate |         |
| Groups          | Panel, Card, Button, GroupCreateForm, PanelSearchBar                                                       | AuthContext, useNavigate            |         |
| Home            | RegisterForm, LoginForm, EditUserForm                                                                      | AuthContext                         |         |
| NotFound        | Card                                                                                                       |                                     |         |
| OverView        | Panel, Card, ThumbNail, ChatSend, MessageButton, FavoriteSetButton                                         | AuthContext, useMemo, useNavigate   |         |
| ProductDetail   | Panel, Card, Button, ThumbNail, FavoriteSetButton, ChatSendMessageButton, TransactionForm, ProductEditForm | AuthContext, useParams, useNavigate |         |
| Products        | Panel, Card, Button, PanelSearchBar, FavoriteSetButton, ProductCreateForm                                  | AuthContext                         |         |
| Transactions    | Panel, Card, Button, ThumbNail, ChatSendMessageButton                                                      | AuthContext                         |         |
| UserDetail      | Panel, Card, UserMap, FavoriteSetButton, ChatSendMessageButton                                             | AuthContext, useParams, useNavigate |         |
| Users           | Panel, Card, PanelSearchBar, ThumbNail, ChatSendMessageButton, FavoriteSetButton                           | AuthContext, useNavigate            | Sí      |
| Welcome         | Card, WelcomeMap                                                                                           | AuthContext                         |         |
|-----------------|------------------------------------------------------------------------------------------------------------|-------------------------------------|---------|





## 2. Liberías utilizadas

### Leaflet + React-Leaflet

    Es el motor de los mapas que se muestran en las páginas de bienvenida y detalle de usuario. Renderiza un mapa interactivo que coloca marcadores en la ubicación de productos o usuarios con popups que muestran información de los mismos según el caso y el contexto de autenticación.


### OpenStreetMap / Nominatim

    Aunque no se trata de una librería, es el servicio utilizado para rellenar las búsquedas de Ciudades o Pueblos. Para evitar que el usuario introduzca un string con un nombre en el input, se sugieren coincidencias sobre las que hay que hacer click. Esto asegura que se proporciona un nombre de localización y unas coordenadas.








# LA DESPENSA COMÚN - BACKEND

 https://despensacomun.onrender.com 
 
 El servidor TARDA 30 SEGUNDOS EN DESPERTAR por primera vez si ha estado inactivo.


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

        git clone https://github.com/Charlietbr/DespensaComun.git

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