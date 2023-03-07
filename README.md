# onemodel

OneModel - Universal JS Data BaseModel and Store to be used in front-end and back-end

#### Basic usage:

**Client:**

    import {OneModel} from 'onemodel'
    const user = new OneModel({firstName: 'Eddie', lastName: 'Money'});
    user.save();

by default will issue POST /model/

**Server** (Node with Express):

    import {OneModel} from 'onemodel';
    router.post('/api/onemodel/', (data) => {
        const user = new OneModel(data);
        user.save();
    })

<br/>
<br/>

#### Sharing OneModel basics between Client and Server

**Define Common OneModel**

    class User extends OneModel {

        static getConfig() {}

        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        }
    }

**Client: **

    import User from '../common/user';

    const user = new User(firstName: 'Eddie', lastName: 'Money');
    console.log(user.getFullName());
    user.save();

**Server: **

    import User from '../common/user';

    router.post('/api/user', (data) => {
        const user = new User(data);
        console.log(user.getFullName());
        user.save();
    })
