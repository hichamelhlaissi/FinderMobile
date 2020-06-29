import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    Button,
    Image, RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Ionicons, Entypo} from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import * as ImagePicker from "expo-image-picker";
import { Formik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import {auth, db, storage} from '../Service/FirebaseConfig';
import PostImages from "./PostImages";

import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-native-datepicker";
export default class EditPostHuman extends Component{

    constructor(props){
        super(props);
        let today = new Date();
        this.postId = props.route.params.postId;
        this.state={
            images: [],
            imagesDb: [],
            imageName: "",
            prevImages:[],
            post:[],
            isChecked: false,
            isCheckeddateLost: false,
            isLoading: false,
            dateLost: '',
            dateBirthDay: '',
            showdateLost: false,
            showdateBirthDay:false,
            isCheckeddateBirthDay:false,
            error:'',
            isLoadingSpinner:true,
        };
    }


    showdateLostPicker = (selectedDate) => {
        this.setState({showdateLost: true});
    };
    showdateBirthDayPicker=()=> {
        this.setState({showdateBirthDay: true});
    };

    onChooseImagePress = async () => {
        if (Object.keys(this.state.images).length === 5){
            Alert.alert("Attention!!", 'error');
        }else if (this.state.imageName === ""){
            Alert.alert("Attention!!", 'error');
        }else{
            let result = await ImagePicker.launchImageLibraryAsync();
            if (result.type === 'image'){
                this.state.images.push({uri: result.uri, name: this.state.imageName});
                this.setState({imageName: ""})
            }else {
                Alert.alert("Error!!", 'Please select an image');
            }

        }
    };

    handleDelete = imageUri => {
        const images = this.state.images.filter(image => image.uri !== imageUri);
        this.setState({ images: images });
    };
    uploadImage = async (Data,uri,imageNumber,Key,uid) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        let ref = storage.ref().child("PostImages/"+uid+"/"+Key+"/"+imageNumber+Key);
        let NewImages= {
            deleted:false,path: imageNumber+Key
        };
        Data.push(NewImages);
        db.ref('Posts/'+Key).update({Images: Data});
        return ref.put(blob);
    };
    OnSubmitPost=(values)=>{
        let updatedAt = Date.parse(new Date());
        this.setState({isLoading:true});
        let uid = auth.currentUser.uid;
        let dateLost= this.state.dateLost;
        let dateBirthDay= this.state.dateBirthDay;
        let postId = this.postId;
        if (uid){
            db.ref('Posts/'+postId).update({
                updatedAt:updatedAt,
                fullName:values.fullName,
                placeLost:values.placeLost,
                description:values.description,
                dateLost:dateLost,
                dateBirthDay:dateBirthDay,
                numberContact:values.numberContact,
                emailContact:values.emailContact,

            }, function (error) {
                if (error) {
                    set();
                    alert(error.message);
                } else {
                    set();
                    console.log('All Set');
                }
            }).then((e)=> {
                let over=this;
                let ref = db.ref("/Posts");
                let query = ref.orderByKey().equalTo(postId);
                query.once("value",function (snapshot) {}).then((e)=>{
                    e.forEach(function (child) {
                        let Data = child.val().Images;
                        for (let image of this.state.images){
                            let i =(S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
                            over.uploadImage(Data,image.uri, i, postId,uid);

                        }
                    }.bind(this));




                });
                return Promise.all(uid);
            }).finally((e)=>{alert()})
        }
        /**
         * @return {string}
         */
        const S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        const set=()=>{
            this.setState({isLoading:false})
        };
        const alert=()=>{
            return ( Alert.alert(
                "Alert",
                "Post Updated",
                [
                    { text: "OK", onPress: () => this.props.navigation.goBack() }
                ],
                { cancelable: false }
            ))

            //return (alert('Post Updated'));
        }

    };
    componentDidMount() {
        this.getPost();
    }
    getPost=(Data, Change=()=>this.setState({post:Data, isLoadingSpinner:false,dateLost: Data.dateLost, dateBirthDay: Data.dateBirthDay,}))=>{
        setTimeout(function () {
            let postId = this.postId;
            let ref = db.ref("/Posts");
            let query = ref.orderByKey().equalTo(postId);
            query.once("value", function (snapshot) {
                snapshot.forEach(function (child) {
                    Data = child.val();
                    Change();
                })
            });
        }.bind(this),1000);

    };
    softDeleteImagePost=(postId, keyImage)=>{
        let ref = db.ref("/Posts");
        let query = ref.orderByKey().equalTo(postId);
        query.once("value",function (snapshot) {
            snapshot.forEach(function (child) {
                let data = child.val();
                let dataImages = data.Images;
                dataImages.forEach(function (part, index) {
                        if (part.path === keyImage){
                            this[index].deleted = true;
                            db.ref('Posts/' + postId).update({
                                Images: dataImages,
                            }).then(r  =>set());
                        }
                }, dataImages);

            })
        });
        const set=()=>{
            this.getPost();
        }
    };
    render() {
        if (this.state.isLoadingSpinner){
            return (<View style={styles.isLoading}><Image source={require('../../assets/spinner.gif')}/></View>)
        }
        const OnChangedateLost=(e)=>{
            let date = e.nativeEvent.timestamp;
            if (e.type === "set"){
                this.setState({showdateLost: false});
                this.setState({dateLost:date})
            }
        };
        const OnChangedateBirthDay=(e)=>{
            let date = e.nativeEvent.timestamp;
            if (e.type === "set"){
                this.setState({showdateBirthDay: false});
                this.setState({dateBirthDay:date})
            }
        };
        const UnknowndateLost=()=>{
            this.setState({
                isCheckeddateLost:!this.state.isCheckeddateLost,
            });
            if (!this.state.isCheckeddateLost){
                this.state.post.dateLost='';
            }if (this.state.isCheckeddateLost){
                this.state.post.dateLost= this.state.dateLost
            }
        };
        const UnknowndateBirthDay=()=>{
            this.setState({
                isCheckeddateBirthDay:!this.state.isCheckeddateBirthDay,
            });
            if (!this.state.isCheckeddateBirthDay){
                this.state.post.dateBirthDay= '';
            }if (this.state.isCheckeddateBirthDay){
                this.state.post.dateBirthDay= this.state.dateBirthDay;
            }
        };
        const Set=(props)=>{
            setTimeout(function () {
                props.resetForm()
            },10)
        };
        let imagesData =this.state.post.Images;
        return (
            <SafeAreaView style={styles.container}>
            <Formik
                enableReinitialize={true}
                initialValues={{
                    fullName:this.state.post.fullName,
                    placeLost:this.state.post.placeLost,
                    description:this.state.post.description,
                    numberContact:this.state.post.numberContact,
                    emailContact:this.state.post.emailContact,
                }}
                onSubmit={(values, {resetForm}) =>{
                    this.OnSubmitPost(values);
                    resetForm({values: ''})
                }}
            >
                {(props)=>(
                    <ScrollView showsVerticalScrollIndicator={true}>
                    <View style={styles.inputs}>

                        <View style={styles.notes}>
                            <Text style={{marginLeft:5}}>{'\u2B24'} You can add any other information on the description</Text>
                            <Text style={{marginLeft:5}}>{'\u2B24'} If you don't know Date Lost or Birthday please check the check box </Text>
                            <Text style={{marginLeft:5}}>{'\u2B24'} Information must be true If not please don't add it to avoid any problems</Text>
                        </View>
                        <Text style={{fontSize:18}}>Full Name</Text>
                        <TextInput
                            onChangeText={props.handleChange('fullName')}
                            value={props.values.fullName}
                            style={styles.input}
                            maxLength={40}
                            placeholder="Full Name"
                            underlineColorAndroid = "transparent"
                            placeholderTextColor = "#a9a9a1"
                            autoCapitalize = "none"
                        />
                        <Text style={{fontSize:18}}>Images</Text>
                        <View style={{flexDirection: 'column', marginTop: 10}}>
                            <View style={styles.documents}>
                                <TextInput
                                    style={styles.imageInput}
                                    value={this.state.imageName}
                                    maxLength={22}
                                    placeholder="Image Name (required)"
                                    underlineColorAndroid = "transparent"
                                    placeholderTextColor = "#a9a9a1"
                                    autoCapitalize = "none"
                                    onChangeText={(value) => { this.setState({imageName: value})}}
                                />
                                <TouchableOpacity style={styles.goChooseButton} onPress={this.onChooseImagePress}>
                                    <Text style={styles.goChooseButtonText}>Choose Image</Text>
                                </TouchableOpacity >

                            </View>
                            <View>
                                {
                                    Object.keys(this.state.images).length   === 0 ? <View style={{marginTop: 8,marginBottom:10}}><Text style={{opacity: 0.4}}>No documents uploaded</Text></View>
                                        :
                                        this.state.images.map((image) => {
                                            return (
                                                <View style={styles.documentsAdded} key={image.uri}>
                                                    <Text>{image.name}</Text>
                                                    <Ionicons onPress={() => this.handleDelete(image.uri)} name="ios-trash" size={25} color="#000" style={{opacity: 0.4,marginLeft:250}} />
                                                </View>
                                            )
                                        })
                                }
                            </View>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {
                                Object.keys(this.state.post.Images).length > 0 ?(
                                    imagesData.map(key=>{
                                        if (!key.deleted){
                                            return (
                                                <TouchableOpacity onPress={()=> {Alert.alert(
                                                    "Alert",
                                                    "Are you sure to delete this photo",
                                                    [
                                                        {
                                                            text: "Cancel",
                                                            onPress: () => console.log("Cancel Pressed"),
                                                            style: "cancel"
                                                        },
                                                        { text: "OK", onPress: () => this.softDeleteImagePost(this.postId,key.path) }
                                                    ],
                                                    { cancelable: false }
                                                );}}>
                                                    <PostImages postId={this.postId} uid={auth.currentUser.uid} keyImage={key.path} path={'EditPostHuman'}/>
                                                </TouchableOpacity>
                                            )
                                        }

                                    })
                                ):<View><Text>Post Have No Images</Text></View>
                            }
                            </ScrollView>

                        </View>
                        {this.state.showdateLost && (
                            <DateTimePicker
                                value={this.state.dateLost}
                                maximumDate={this.state.post.createdAt}
                                mode={'date'}
                                is24Hour={true}
                                display="spinner"
                                onChange={(e)=>OnChangedateLost(e)}
                            />
                        )}
                        <Text style={{fontSize:18, marginTop:6}}>Date Lost</Text>
                        <TouchableOpacity onPress={() => {
                            this.showdateLostPicker();
                        }}>
                            <View style={{flexDirection: 'row', marginTop: 10}}>
                                <Entypo name="calendar" size={24} color="black" style={styles.inputDateIcon}/>
                                <Text style={styles.inputDate}>{moment(this.state.dateLost).format("MM/DD/YYYY").toString()}</Text>
                                <CheckBox
                                    onClick={()=>UnknowndateLost()}
                                    tyle={styles.inputCheckBox}
                                    isChecked={this.state.isCheckeddateLost}
                                />
                            </View>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            onChangeText={props.handleChange('placeLost')}
                            value={props.values.placeLost}
                            maxLength={22}
                            placeholder="Place Lost"
                            underlineColorAndroid = "transparent"
                            placeholderTextColor = "#a9a9a1"
                            autoCapitalize = "none"
                        />
                        {this.state.showdateBirthDay && (
                            <DateTimePicker
                                value={this.state.dateBirthDay}
                                maximumDate={this.state.post.createdAt}
                                mode={'date'}
                                is24Hour={true}
                                display="spinner"
                                onChange={(e)=>OnChangedateBirthDay(e)}
                            />
                        )}
                        <Text style={{fontSize:18, marginTop:6}}>Birthday</Text>
                        <TouchableOpacity onPress={() => {
                            this.showdateBirthDayPicker();
                        }}>
                            <View style={{flexDirection: 'row', marginTop: 10}}>
                                <Entypo name="calendar" size={24} color="black" style={styles.inputDateIcon}/>
                                <Text style={styles.inputDate}>{moment(this.state.dateBirthDay).format("MM/DD/YYYY").toString()}</Text>
                                <CheckBox
                                    onClick={()=>UnknowndateBirthDay()}
                                    tyle={styles.inputCheckBox}
                                    isChecked={this.state.isCheckeddateBirthDay}
                                />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.textAreaContainer} >
                            <TextInput
                                style={styles.textArea}
                                onChangeText={props.handleChange('description')}
                                value={props.values.description}
                                underlineColorAndroid="transparent"
                                placeholder=' description (anything you want to add)'
                                placeholderTextColor="grey"
                                numberOfLines={10}
                                multiline={true}
                            />
                        </View>
                        <Text style={{fontSize:18, marginTop:6}}>Contact Information</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={props.handleChange('numberContact')}
                            value={props.values.numberContact}
                            minLength={10}
                            maxLength={10}
                            placeholder="Phone Number"
                            keyboardType='numeric'
                            underlineColorAndroid = "transparent"
                            placeholderTextColor = "#a9a9a1"
                            autoCapitalize = "none"
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={props.handleChange('emailContact')}
                            value={props.values.emailContact}
                            placeholder="Email"
                            underlineColorAndroid = "transparent"
                            placeholderTextColor = "#a9a9a1"
                            autoCapitalize = "none"
                        />
                        <View style={{width: '100%'}}>
                            <TouchableOpacity style={styles.addNewStadiumButton} onPress={props.handleSubmit}>
                                {this.state.isLoading ? (
                                    <View style={{ flex: 1, padding: 20 }}>
                                        <ActivityIndicator color="white"/>
                                    </View>
                                ):<Text style={styles.addNewStadiumButtonText}>Submit</Text>}
                                {
                                    this.props.refresh && (
                                        Set(props)
                                    )
                                }
                            </TouchableOpacity >
                        </View>

                    </View>
                    </ScrollView>
                )}
            </Formik>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft:5
    },
    inputDateIcon:{
        marginBottom: 9,
        marginTop:5,
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        opacity: 0.5,
        marginRight:8
    },
    notes:{
        flexDirection: 'column',
        backgroundColor: 'rgba(212,220,202,0.59)',
        height: 120,
        width: "100%",
        alignSelf: 'center',
        marginTop: 10,
        marginBottom:10,
        borderRadius: 30/2,
    },
    input: {
        height: 40,
        fontSize: 16,
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        opacity: 0.5,
        width: "100%",
        alignSelf: 'center',
        marginBottom: 8,
    },
    inputDate: {
        height: 40,
        fontSize: 16,
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        opacity: 0.5,
        width: "85%",
        alignSelf: 'center',
        marginBottom: 8,
        marginTop:5,
    },
    inputCheckBox:{
        marginBottom: 9,
        marginTop:5,
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        opacity: 0.5,
        marginRight:8
    },
    imageInput: {
        height: 40,
        fontSize: 16,
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        opacity: 0.5,
        width: "60%",
        alignSelf: 'center',
        marginBottom: 8
    },
    inputs: {
        marginTop: 5,
        width: '90%'
    },
    stadiumAddress: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        width: '95%',
        alignSelf: 'center',
    },
    documents: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
    },
    goChooseButton: {
        borderRadius: 30/2,
        backgroundColor: "#E8F7FF",
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        justifyContent: 'center',
        height: 30,
        alignSelf: 'center'
    },
    goChooseButtonText: {
        fontSize: 10,
        color: "#5780D9",
        textTransform: "uppercase",
        textAlign: "center",
    },
    addNewStadiumButton: {
        backgroundColor: "#5780D9",
        paddingLeft: 12,
        paddingRight: 12,
        marginTop: 5,
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
    addNewStadiumButtonText: {
        fontSize: 14,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: "center",
        fontWeight: 'bold',
    },
    textAreaContainer: {
        padding: 5,
        marginTop: 20
    },
    textArea: {
        borderColor: "#333333",
        borderWidth: 1,
        height: 100,
        justifyContent: "flex-start",
        opacity: 0.5
    },
    documentsAdded: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        width: '92%',
        marginTop: 15,
    },
    spinnerTextStyle: {
        color: '#ffffff'
    },
    searchIcon: {
        padding: 8,
    },
    inputPicker: {
        flexDirection: 'row',
        borderColor: '#a9a9a1',
        borderBottomWidth: 1,
        width:320,
    },
    autocompleteContainer: {
        zIndex:999
    },
    inputContainer: {
        marginBottom: 50,
        height: 250,
        opacity: 0.5,
    },
    itemText: {
        fontSize: 17,
        color:'#000000',
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginLeft:100,
        marginHorizontal: 16
    },
    isLoading : {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
