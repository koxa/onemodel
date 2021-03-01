# onemodel
OneModel - Universal JS Data BaseModel and Store to be used in front-end and back-end

#### Basic usage:

**Client:**

    import {OneModel} from 'onemodel'
    const user = new OneModel({firstName: 'Eddie', lastName: 'Money'});<br/>
    user.save();

by default will issue POST /model/

**Server** (Node with Express):

    import {OneModel} from 'onemodel'; <br/>
    router.post('/model/', (data) => { <br/>
        const user = new ServerModel(data); <br/>
        user.save(); // saves to file model.txt
    })

<br/>
<br/>

#### Sharing OneModel basics between Client and Server

**Define Common BaseModel**

    class User extends BaseModel {
        
        static getDefaultProps() {
            firstName: '',
            lastName: ''
        }
        
        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        }
    }

**Client: Wrapping User with ClientModel**

    import User from '../common/user';
    class ClientUser extends ClientModelWrapper(User) {}
    const user = new ClientUser(firstName: 'Eddie', lastName: 'Money');
    console.log(user.getFullName());
    user.save();

**Server: Wrapping User with ServerModel**
    
    import User from '../common/user';
    class ServerUser extends ServerModelWrapper(User) {}
    router.post('/user', (data) => {
        const user = new User(data);
        console.log(user.getFullName());
        user.save();
    })
    


