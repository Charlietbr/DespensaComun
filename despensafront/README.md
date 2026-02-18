[![Logo despensa](https://despensa-comun.vercel.app/assets/logodespensaWhite-CsSgOdWL.webp)](https://despensa-comun.vercel.app)


# LA DESPENSA COMÚN - FRONTEND

https://despensa-comun.vercel.app


## 1.Estructura de PÁGINAS

### Welcome
* Es la página de acceso. Contiene el enlace a Home para acceder o crear una cuenta y un mapa de los productos que se encuentran publicados que, sólo en casa de que haya un usuario logueado, permitirán el acceso a la ficha de cada producto para poder conocer sus detalles o iniciar una transacción.

### Home
* Es donde se alojan los formularios de usuario: LoginForm, CreateUserForm o EditUserForm. En caso de no haber usuario logueado aparecerá el formulario de login con un link al de creación de usuario por si aún no ha sido creado (CreateUserForm tiene el link a login por si se trata de un usuario con cuenta creada que quiere acceder).

### OverView
* Una vez que se ha accedido a la plataforma, OverView ofrece información del usuario logueado, acceso a la edición del perfil o cierre de sesión y una serie de cards con información reducida sobre los productos, grupos, transacciones, valoraciones y, en el caso de los administradores, el listado de usuarios. Al pulsar sobre cualquiera de ellos navegamos a la página correspondiente que muestra la información extendida y el acceso a los detalles.

### Users (sólo para administradores)
* Presenta la barra de búsqueda de usuarios y el listado de los mismos.

### UserDetail
* Detalle de usuario con información del usuario, mapa con su ubicación, sus valoraciones y los botones para acceder al chat, o agregarlo a favoritos.

### Products
* Contiene un Card con los productos publicados por el usuario y el botón para publicar y otro con los publicados por otros usuarios. 

### ProductDetail
* Muestra la información del producto: categoría (intercambio o donación), estado, cantidad disponible, ubicación. También la información del productor y las acciones disponibles.

### Groups
* Contiene el Card de los grupos creados por el usuario y el de los grupos existentes creados por otros usuarios y que no sean grupos ocultos.

### GroupDetail
* Muestra un Card de información del grupo, el de sus miembros y el de las opciones. Para grupos de otros usuarios gestionamos desde aquí la opción de solicitar unirse o abandonar el grupo. Para los propios podemos acceder al formulario de edición del grupo (cambiar datos del grupo, convertirlo en privado si no queremos más miembros o eliminarlo). Desde esta página también podemos aceptar o rechazar solicitudos para unirse de otros usuarios.

### Favorites
* Contiene un Card de productos, otro de grupos y otro de usuarios que hayamos guardado como favoritos.

### Transactions
* Trueques. Es la página donde tenemos un Card con las solicitudes enviadas por otros usuarios para nuestros productos y otro con las que hemos enviado para intercambiar o pedir productos a otros usuarios. Desde aquí se pueden aceptar, rechazar, cancelar y valorar las distintas operaciones.

### NotFound
* Esta página incuye el card con el aviso y la imagen que indican que se ha intentado acceder a una ruta que no existe.

### ChatOverlay
* Es la página que muestra, en un componente flotante, el contenedor de los mensajes privados o chats grupales. Consta de un aside con los chats de grupos y otro con los mensajes directos, y de un contenedor principal donde se muestran la conversación y el input para escribir y enviar mensajes.


## Use de tipos de componentes y Hooks por página

| Página          | Componenes                                                                          | Contexto + extra Hooks              | Admin? |
|:----------------|:------------------------------------------------------------------------------------|-------------------------------------|:------:|
| ChatOverlay     |                                                                                     | useLocation, createPortal           |        |
| Favorites       | Panel, Card, SetFavorite, ThumbNail, ChatSendMessageButton                          | AuthContext                         |         |
| GroupDetail     | Panel, Card, Button, GroupEditForm, Thumbnail, FavoriteSetButton, ChatSendMessageButton | AuthContext, useParams, useNavigate |         |
| Groups          | Panel, Card, Button, GroupCreateForm, PanelSearchBar                                    | AuthContext, useNavigate            |         |
| Home            | RegisterForm, LoginForm, EditUserForm                                                   | AuthContext                         |         |
| NotFound        |                                                                                         |                                     |         |
| OverView        | Panel, Card, ThumbNail, ChatSend, MessageButton, FavoriteSetButton                      | AuthContext, useMemo, useNavigate   |         |
| ProductDetail   | Panel, Card, Button, ThumbNail, FavoriteSetButton, ChatSendMessageButton, TransactionForm, ProductEditForm | AuthContext, useParams, useNavigate |         |
| Products        | Panel, Card, Button, PanelSearchBar, FavoriteSetButton, ProductCreateForm                                  | AuthContext                         |         |
| Transactions    | Panel, Card, Button, ThumbNail, ChatSendMessageButton                                                      | AuthContext                         |         |
| UserDetail      | Panel, Card, UserMap, FavoriteSetButton, ChatSendMessageButton                                             | AuthContext, useParams, useNavigate |         |
| Users           | Panel, Card, PanelSearchBar, ThumbNail, ChatSendMessageButton, FavoriteSetButton                           | AuthContext, useNavigate            | Sí      |
| Welcome         | Card, WelcomeMap                                                                                           | AuthContext                         |         |






## 2. Liberías utilizadas

### Leaflet + React-Leaflet

* Es el motor de los mapas que se muestran en las páginas de bienvenida y detalle de usuario. Renderiza un mapa interactivo que coloca marcadores en la ubicación de productos o usuarios con popups que muestran información de los mismos según el caso y el contexto de autenticación.


### OpenStreetMap / Nominatim

* Aunque no se trata de una librería, es el servicio utilizado para rellenar las búsquedas de Ciudades o Pueblos. Para evitar que el usuario introduzca un string con un nombre en el input, se sugieren coincidencias sobre las que hay que hacer click. Esto asegura que se proporciona un nombre de localización y unas coordenadas.




##

**Carlos Campillo Matías**

[LinkedIn](https://www.linkedin.com/in/carloscampillovfx/)

Entrega de Proyecto Final. {RTC - Desarrollo Web}.

*Enero de 2026*