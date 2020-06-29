import React, {Component} from 'react';
import {ActivityIndicator, Alert, AppState, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Picker} from 'react-native';
import {Ionicons, Entypo} from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import * as ImagePicker from "expo-image-picker";
import { Formik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import DateTimePicker from "@react-native-community/datetimepicker";
import {auth, db, storage} from "../Service/FirebaseConfig";

export default class Human extends Component{

    constructor(props){
        super(props);
        this.state={
            images: [],
            imagesDb: [],
            imageName: "",
            isChecked: false,
            isCheckeddateLost: false,
            isLoading: false,
            dateLost: Date.parse(new Date()),
            showdateLost: false,
            objectName:'Phone',
            showobjectName:true,
            showotherObjectName:false,
            error:'',
        };
    }
    showdateLostPicker = (selectedDate) => {
        this.setState({showdateLost: true});
    };

    termsAndConditions(){
        return <View style={{marginLeft: 8}}><Text>I accept all <Text style={{textDecorationLine: 'underline'}} onPress={() => alert('Terms & Conditions')}>Terms & Conditions</Text></Text></View>
    };

    uploadImage = async (uri, imageNumber, postKey,uid) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        let ref = storage.ref().child("PostImages/"+uid+"/"+postKey+"/"+imageNumber+postKey);
        this.state.imagesDb.push({deleted:false,path: imageNumber+postKey});
        db.ref('Posts/'+postKey).update({
            Images: this.state.imagesDb,
        });
        return ref.put(blob);
    };
    OnSubmitPost=(values)=>{
        console.log(values);
        let createdAt = Date.parse(new Date());
        this.setState({isLoading:true});
        let uid = auth.currentUser.uid;
        let dateLost= this.state.dateLost;
        let objectName=this.state.objectName;
        let otherObjectName=this.state.otherObjectName;
        if (uid){
            db.ref('Posts').push({
                uid : uid,
                postType:'Object',
                createdAt:createdAt,
                updatedAt:createdAt,
                objectName:objectName,
                otherObjectName:values.otherObjectName,
                placeLost:values.placeLost,
                description:values.description,
                dateLost:dateLost,
                numberContact:values.numberContact,
                emailContact:values.emailContact,
                active: true,
                deleted: false,
                clickNumber:0,

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
                let Key = e.key;
                for (let image of this.state.images){
                    let i =(S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
                    this.uploadImage(image.uri, i, Key,uid).then(r =>{
                    });
                }
                return Promise.all(e);
            }).finally((r)=> {
                this.setState({images: [],
                    imagesDb: [],
                    imageName: "",
                    isChecked: false,
                    isCheckeddateLost: false,
                    isLoading: false,
                    dateLost: Date.parse(new Date()),
                    showdateLost: false,
                    objectName:'',
                    showobjectName:true,
                    showotherObjectName:false,
                    error:'',})
            })
        }
        const set=()=>{
            this.setState({isLoading:false})
        };
        /**
         * @return {string}
         */
        const S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
    };
    onChooseImagePress = async () => {
        if (Object.keys(this.state.images).length === 5){
            Alert.alert("Attention!!", 'error');
        }else if (this.state.imageName === ""){
            Alert.alert("Attention!!", 'error');
        }else{
            let result = await ImagePicker.launchImageLibraryAsync();
            this.state.images.push({uri: result.uri, name: this.state.imageName});
            this.setState({imageName: ""})
        }
    };
    handleDelete = imageUri => {
        const images = this.state.images.filter(image => image.uri !== imageUri);
        this.setState({ images: images });
    };
   
    OnSelectSpecie=(e)=>{
        if (e === 'Other'){
            this.setState({objectName: ''});
            this.setState({showotherObjectName:true})
        }else {
            this.setState({objectName: e});
            this.setState({showotherObjectName:false})
        }
    };
    render() {
        if (this.props.refresh){
            setTimeout(function () {
                set();
                this.setState({images: [],
                    imagesDb: [],
                    imageName: "",
                    isChecked: false,
                    isCheckeddateLost: false,
                    isLoading: false,
                    dateLost: Date.parse(new Date()),
                    showdateLost: false,
                    objectName:'',
                    showobjectName:true,
                    showotherObjectName:false,
                    error:'',})
            }.bind(this),10);
            const set=()=>{
                this.handleDelete();
                //this.textInput.clear();
            };
        }
        const Set=(props)=>{
            setTimeout(function () {
                props.resetForm()
            },10)
        };
        const OnChangedateLost=(e)=>{
            let date = e.nativeEvent.timestamp;
            if (e.type === "set"){
                this.setState({showdateLost: false});
                this.setState({dateLost:date})
            }
        };
        const UnknowndateLost=()=>{
            this.setState({
                isCheckeddateLost:!this.state.isCheckeddateLost,
            });
            if (!this.state.isCheckeddateLost){
                this.setState({
                    dateLost:''
                });
            }if (this.state.isCheckeddateLost){
                this.setState({
                    dateLost: Date.parse(new Date()),
                });
            }
        };
        
        return (
            <Formik
                enableReinitialize
                initialValues={{
                    placeLost:'',
                    description:'',
                    otherObjectName:'',
                    numberContact:'',
                    emailContact:'',
                }}
                onSubmit={(values, {resetForm}) =>{
                    this.OnSubmitPost(values);
                    resetForm({values: ''})
                }}>
                {(props)=>(
                    <View style={styles.inputs}>
                        <View style={styles.notes}>
                            <Text style={{marginLeft:5}}>{'\u2B24'} You can add any other information on the description</Text>
                            <Text style={{marginLeft:5}}>{'\u2B24'} If you don't know Date Lost or Birthday please check the check box</Text>
                            <Text style={{marginLeft:5}}>{'\u2B24'} Information must be true If not please don't add it to avoid any problems</Text>
                        </View>
                        <Text style={{fontSize:18}}>Object</Text>
                        {this.state.showobjectName && (
                            <Picker style={styles.inputPicker}
                                    selectedValue={this.state.objectName}
                                    onValueChange={e => this.OnSelectSpecie(e)}>
                                <Picker.Item label="Phone" value="Phone"/>
                                <Picker.Item label="Wallet" value="Wallet"/>
                                <Picker.Item label="Other" value="Other"/>
                            </Picker>
                        )}
                        {this.state.showotherObjectName && (
                            <TextInput
                                onChangeText={props.handleChange('otherObjectName')}
                                value={props.values.otherObjectName}
                                style={styles.input}
                                maxLength={40}
                                placeholder="Other"
                                underlineColorAndroid = "transparent"
                                placeholderTextColor = "#a9a9a1"
                                autoCapitalize = "none"

                            />
                        )}
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
                                    Object.keys(this.state.images).length   === 0 ? <View style={{marginTop: 8}}><Text style={{opacity: 0.4}}>No documents uploaded</Text></View>
                                        :
                                        this.state.images.map((image) => {
                                            return (
                                                <View style={styles.documentsAdded} key={image.uri}>
                                                    <Text>{image.name}</Text>
                                                    <Ionicons onPress={() => this.handleDelete(image.uri)} name="ios-trash" size={18} color="#000" style={{opacity: 0.4}} />
                                                </View>
                                            )
                                        })
                                }
                            </View>
                        </View>
                        {this.state.showdateLost && (
                            <DateTimePicker
                                value={this.state.dateLost}
                                maximumDate={this.state.dateLost}
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
                            placeholder="Phone Number"
                            minLength={10}
                            maxLength={10}
                            underlineColorAndroid = "transparent"
                            keyboardType='numeric'
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

                            <CheckBox
                                style={{flex: 1, padding: 10, marginBottom: 8}}
                                onClick={()=>{
                                    this.setState({
                                        isChecked:!this.state.isChecked
                                    });
                                }}
                                isChecked={this.state.isChecked}
                                rightTextView={this.termsAndConditions()}
                            />
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
                )}
            </Formik>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //marginTop: APPROX_STATUSBAR_HEIGHT,
        //justifyContent: 'center',
        //alignItems: 'center',
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
        justifyContent: 'space-between',
        width: '92%',
        marginTop: 8
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
        width:350,
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
    cancelModalButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
});
