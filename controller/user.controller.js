const User = require('../db/user.model');
const asyncWrapper = require('../middleWare/asyncWrapper');
const bcrypt = require('bcryptjs');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const generateJWT = require('../utils/generateToken');
/* =============================== Get All Users ======================================== */
const getAllUsers = asyncWrapper(
    async(req,res)=>{
        const query = req.query;
        const limit = query.limit || 10;
        const page = query.page || 1;
        const skip  = (page - 1 ) * limit;
        const allUsers = await User.find({} , {"__v" : false , "password" : false}).limit(limit).skip(skip);
      return  res.status(201).json({status : "success" , data : {allUsers}});
    }
)
/* =============================== Create New User ======================================== */
const register = asyncWrapper(
    async(req,res , next)=>{
        const {username, email , age , gender , password  ,  role  } = req.body;
        const oldEmail = await User.findOne({email: email});
        if (oldEmail) {
        const error = appError.create("البريد الالكتروني  موجود بالفعل" , 400 , httpStatus.FAIL );;
        return next(error);               
        }
        /* password hashing */
        const hashingPassword = await bcrypt.hash(password , 10);
        const newUser =  new User({
            username,
            email,
            password : hashingPassword,
            role,
            age,
            gender,
            profile : req.file.filename,
        });
        const token = await generateJWT({email : newUser.email , id: newUser._id , role : newUser.role});
        newUser.token = token;
        await newUser.save();
      return  res.status(201).json({status : "success" , data : {newUser} , data_ar : "تم انشاء حساب جديد"});
    }
)
 /* =============================== Login ======================================== */
const login = asyncWrapper(
    async(req,res , next) =>{
    const {email , password} = req.body;
    if (!email && !password) {
        const error = appError.create("يرجاء ادخال بريدك الالكتروني و كلمة المرور" , 400 , httpStatus.FAIL );;
        return next(error);                
    }
    const findUser = await User.findOne({email : email});
    const matchedPassword = await bcrypt.compare(password , findUser.password);
    if (findUser && matchedPassword) {
    const token = await generateJWT({email : findUser.email , id: findUser._id , role : findUser.role});
    console.log(req.currentUser);
    return res.status(200).json({status : "success" , role : findUser.role , id : findUser._id  , data_en : "logged in success" ,
     data_ar : "تم تسجيل الدخول بنجاح" ,token});       
    }
    else{
        const error = appError.create("البريد الالكتروني او كلمة المرور غير صحيحة" , 500 , httpStatus.FAIL );;
        return next(error); 
    }
    }
)
 /* =============================== Update ======================================== */
const updateUser = asyncWrapper(
    async (req , res , next) =>{
        const {username, email , age , gender , password , role  } = req.body;
        const hashingPassword = await bcrypt.hash(password , 10);
        const update = await User.updateOne({_id : req.params.id} , {$set:{
            username,
            email,
            password : hashingPassword,
            role,
            age,
            gender,
            profile : req.file.filename,
        }});
        if (!update) {
            const error = appError.create(httpStatus.MESSAGE , 404 , httpStatus.FAIL );;
           return next(error);
        }
        return res.status(200).json({status : httpStatus.SUCCESS , data_en : "updated this book" , data_ar : "تم التعديل بنجاح"});       
    }
);
 /* =============================== Profile ======================================== */
const deleteUser = asyncWrapper(
    async(req, res ,next)=>{
        const del = await User.deleteOne({_id : req.params.id});
        if (!del) {
        const error = appError.create(httpStatus.MESSAGE , 404 , httpStatus.FAIL );;
        return next(error);
        }
        return res.status(200).json({status : httpStatus.SUCCESS, data_en : "deleted this book" , data_ar : "تم حذف الاكونت بنجاح"} );       
    }
)
 /* =============================== Profile ======================================== */
const profile = asyncWrapper(
    async (req , res , next)=>{
        const id = req.params.id;
        const get_user = await User.findById({_id : id});
           if (!get_user) {
            const error = appError.create(httpStatus.MESSAGE , 400 , httpStatus.FAIL );
           return next(error);
           }
          return res.status(200).json({status:httpStatus.SUCCESS , data : get_user});
    }
)
module.exports = {
    getAllUsers,
    register,
    login,
    updateUser,
    deleteUser,
    profile
}
