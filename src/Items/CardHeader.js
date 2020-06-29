import React, {Component} from "react";
import {
    Text,
    View,
} from "react-native";
import {Thumbnail, Body} from 'native-base'
import {db, storage} from "../Service/FirebaseConfig";
import moment from "moment";

export function NameLastName(props){
    const state={
        FirstName:"",
        LastName:"",
    };
    const set=(Data)=>{
        state.FirstName=Data.FirstName;
        state.LastName=Data.LastName;
    };
    let uid=props.uid;
    db.ref('users').orderByChild('uid').equalTo(uid)
        .once("value",function (snapshot) {
            snapshot.forEach(function (child) {
                let Data=child.val();
                set(Data);
            })
        });

     return (
         <View>
             {
                 state.FirstName === "" && state.LastName === "" ?(
                     <Text style={{fontWeight:"bold",fontSize:16}}>Unknown</Text>
                 ):<Text style={{fontWeight:"bold",fontSize:16}}>{state.FirstName} {state.LastName}</Text>
             }
         </View>
     )
}
export default class CardHeadrer extends Component{
    constructor(props){
        super(props);
        this.uid=this.props.uid;
        this.createdAt=this.props.createdAt;
        this.placeLost=this.props.placeLost;
        this.postType=this.props.postType;
        this.state={
            Data:{},
            image:'',
        }
    }
    componentDidMount() {
        this.getData();
    }

    getData=(Change=(Data)=>{this.setState({Data:Data})})=>{
        db.ref('users').orderByChild('uid').equalTo(this.uid)
            .once("value",function (snapshot) {
                snapshot.forEach(function (child) {
                    Change(child.val());
                    let Data=child.val();
                    profileImage(Data.Image)
                })
            }).then(snapshot=>{

        });
        const profileImage=async (path)=>{
            let ref = storage.ref('ProfileImages/'+this.uid+'/'+path);
            let url = await ref.getDownloadURL();
            this.setState({image:url});
        }
    };
    render() {
        return (
            <View style={{flexDirection:"row"}}>
                {
                    this.state.image !== "" ?(<Thumbnail source={{uri:this.state.image}} />):<Thumbnail source={require('../../assets/unix.png')} />
                }
                    <Body>
                        {
                            this.state.Data.FirstName === "" && this.state.Data.LastName === "" ?(
                                <Text style={{fontWeight:"bold",fontSize:16}}>Unknown</Text>
                            ):<Text style={{fontWeight:"bold",fontSize:16}}>{this.state.Data.FirstName} {this.state.Data.LastName}</Text>
                        }
                        <Text note>{moment(this.createdAt).format("DD-MM-YYYY").toString()} {this.placeLost} - <Text style={{ fontWeight: "bold" }}>{this.postType}</Text></Text>
                    </Body>
            </View>
        );
    }
}