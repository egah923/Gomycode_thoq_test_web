// import 'dart:math';

// import 'package:darren_walters/app/export.dart';
// import 'package:darren_walters/app/modules/extra_applicant_module/widget/warning_dialog.dart';
// import 'package:darren_walters/app/modules/profile/controller/basic_info_controller/basic_information_first_controller.dart';
// import 'package:darren_walters/app/modules/profile/model/data_model/answer_data_model.dart';
// import 'package:darren_walters/app/modules/profile/model/data_model/question_data_model.dart';
// import 'package:darren_walters/app/modules/profile/model/question_answer_model.dart';
// import 'package:darren_walters/app/modules/profile/model/request_model/question_request_model.dart';
// import 'package:darren_walters/app/modules/profile/model/superannuation_model.dart';
// import 'package:darren_walters/app/modules/profile/views/self_mange_fund_view.dart';

// QuestionDataModel? globalDataModel;

// class SelfMangeFundController extends GetxController {
//   RxList<SuperannuationRequestModel> questionList = RxList.empty();
//   AnswerDataModel? answerDataModel;
//   AnswerDataModel? myAnserData;
//   List<QuestionDataModel>? formList = [];
//   final Repository _repository = Get.find<Repository>();

//   @override
//   void onInit() {
//     super.onInit();
//   }

//   @override
//   void onReady() {
//     myAnserData = answerModelForSupernation;
//     createObjectForSuppernuation();
//     super.onReady();
//   }

//   createObjectForSuppernuation() {
//     if (answerModelForSupernation?.userForms?.length == 0) {
//       answerModelForSupernation?.userForms?.add(UserForms(
//           formQuestions: answerModelForSupernation?.allQuestionDataModel));
//     }
//     setDataIntoViews(answerModelForSupernation?.userForms);
//   }

//   void setDataIntoViews(List<UserForms>? userForms) {
//     userForms?.forEach((element) {
//       updateSelectedFormData(element);
//     });

//     var data = userForms?.where((element) => element.isFormCompleted == true);
//     if (data?.length == userForms?.length) {
//       Get.find<BasicInformationFirstController>()
//           .mainQuestionList
//           .forEach((element) {
//         if (element.answerType == typeFormField) {
//           element.isComplete = true;
//           element.formAnswersForSubmitted = submitData();
//           Get.find<BasicInformationFirstController>().update();
//           Get.find<BasicInformationFirstController>().buttonEnable();
//         }
//       });
//     } else {
//       Get.find<BasicInformationFirstController>()
//           .mainQuestionList
//           .forEach((element) {
//         if (element.answerType == typeFormField) {
//           element.isComplete = false;
//           element.formAnswersForSubmitted = submitData();

//           Get.find<BasicInformationFirstController>().update();
//           Get.find<BasicInformationFirstController>().buttonEnable();
//         }
//       });
//     }
//   }

//   updateSelectedFormData(UserForms userForms) {
//     userForms.formQuestions?.forEach((element) {
//       answerTypeSelected(element);
//     });
//     var data =
//         userForms.formQuestions?.where((element) => element.isComplete == true);
//     if (data?.length == userForms.formQuestions?.length) {
//       userForms.isFormCompleted = true;
//     } else {
//       userForms.isFormCompleted = false;
//     }
//   }

//   answerTypeSelected(FormQuestions questionDataModel) {
//     // if alredy save data then show save data accoridng to type
//     switch (questionDataModel.answerType) {
//       case typeSingleSelect:
//         var selectedItem;
//         questionDataModel.answers?.forEach((element) {
//           if (element.selected == true) {
//             questionDataModel.isComplete = true;
//             selectedItem = element;
//             questionDataModel.selectedIndex =
//                 questionDataModel.answers?.indexOf(element);
//           }
//         });
//         break;
//       case typeText || typeInterger:

//         if(questionDataModel?.userAnswer!=null) {
//           questionDataModel.isComplete = true;
//           questionDataModel.freeEditText?.text = questionDataModel?.userAnswer?.answers?.first ?? "";
//         }
//         break;
//     }
//   }

//   addTableData() {
//     var data = UserForms.fromJson(answerModelForSupernation!.userForms!.first.toJson());
//     data.formId=null;
//     data.sId=null;
//     answerModelForSupernation?.userForms?.add(data);
//   }


//   myUpdateData(AnswerDataModel? myAnserData) {
//     var data = myAnserData;
//     data?.allQuestionDataModel?.forEach((element) {
//       element.isComplete = false;
//       element.selectedIndex = -1;
//       element.freeEditText = TextEditingController();
//     });
//     return data;
//   }

//   void isAllCompleted() {
//     for (int i = 0; i < (myAnserData?.userForms?.length ?? 0); i++) {
//       var data = myAnserData?.userForms?[i].formQuestions
//           ?.where((element) => element.isComplete == true);
//       if (data?.length == myAnserData?.userForms?[i].formQuestions?.length) {
//         myAnserData?.userForms?[i].isFormCompleted = true;
//         update();
//       } else {
//         myAnserData?.userForms![i].isFormCompleted = false;
//         update();
//       }
//     }

//     var data = myAnserData?.userForms
//         ?.where((element) => element.isFormCompleted == true);
//     if (data?.length == myAnserData?.userForms?.length) {
//       Get.find<BasicInformationFirstController>()
//           .mainQuestionList
//           .forEach((element) {
//         if (element.answerType == typeFormField) {
//           element.isComplete = true;
//           element.formAnswersForSubmitted = submitData();
//           Get.find<BasicInformationFirstController>().update();
//           Get.find<BasicInformationFirstController>().buttonEnable();
//         }
//       });
//     } else {
//       Get.find<BasicInformationFirstController>()
//           .mainQuestionList
//           .forEach((element) {
//         if (element.answerType == typeFormField) {
//           element.isComplete = false;
//           element.formAnswersForSubmitted = submitData();

//           Get.find<BasicInformationFirstController>().update();
//           Get.find<BasicInformationFirstController>().buttonEnable();
//         }
//       });
//     }
//   }

//   submitData() {
//     List firstSetpData = [];
//     for (int i = 0; i < (myAnserData?.userForms?.length ?? 0); i++) {
//       Map<String, dynamic> mapData = Map<String, dynamic>();
//       mapData['form_id'] = myAnserData?.userForms?[i].formId ?? null;
//       mapData['answer_id'] = answerModelForSupernation?.sId;
//       mapData['answers'] =
//           formQuestions(myAnserData?.userForms![i].formQuestions);
//       firstSetpData.add(mapData);
//     }

//     print("formObjectData========> $firstSetpData");
//     return firstSetpData;
//   }

//   formQuestions(List<FormQuestions>? allQuestionDataModel) {
//     var list = [];
//     allQuestionDataModel?.forEach((element) {
//       list.add(answerDatFormat(element));
//     });
//     ;
//     return list;
//   }

//   myAnswerData(List firstSetpData) {
//     Map<String, dynamic> dataFormat = Map<String, dynamic>();
//     dataFormat['answers'] = firstSetpData;
//     dataFormat['forms'] = [];
//     return dataFormat;
//   }

//   answerDatFormat(FormQuestions questionDataModel) {
//     Map<String, dynamic> map = Map<String, dynamic>();
//     map['question_id'] = questionDataModel.sId;
//     map['answers_ids'] = answerType(questionDataModel);
//     map['answers'] = freeEditTextAnswers(questionDataModel);
//     return map;
//   }

//   answerType(FormQuestions questionDataModel) {
//     switch (questionDataModel.answerType) {
//       case typeSingleSelect:
//         List answerList = [];
//         if (questionDataModel.selectedIndex != -1) {
//           answerList.add(questionDataModel
//               .answers![questionDataModel.selectedIndex ?? 0].sId);
//         }
//         return answerList;
//       case typeMultipleSelect:
//         List answerList = [];
//         questionDataModel.answers?.forEach((element) {
//           if (element.selected == true) {
//             answerList.add(element.sId);
//           }
//         });
//         return answerList;
//     }
//   }

//   freeEditTextAnswers(FormQuestions questionDataModel) {
//     switch (questionDataModel.answerType) {
//       case typeLocationBox ||
//             typeText ||
//             typeInterger ||
//             typeYear ||
//             percentage:
//         List answerList = [];
//         answerList.add(questionDataModel.freeEditText?.text);
//         return answerList;
//     }
//   }

//   deleteFormDialog() {}

//   void deleteDialog(List<UserForms>? userForms, int index) {
//     Get.dialog(WarningDialog(
//         heading: strDelete,
//         descrption: strDeleteForm,
//         onPressSubmit: () {
//           Get.back();
//           formDeleteApiCall(userForms, index);
//         },
//         onPressCancel: () {
//           Get.back();
//         }));
//   }

//   formDeleteApiCall(List<UserForms>? userForms, int index) {
//     CustomLoader().show(Get.overlayContext);
//     _repository
//         .deleteFormApiCall(formId: userForms![index].formId)
//         .then((value) async {
//       CustomLoader().hide();
//       if (value != null) {
//         userForms?.removeAt(index);
//         update();
//       }
//     }).onError((error, stackTrace) {
//       CustomLoader().hide();
//       showToast(message: error.toString());
//     });
//   }
// }