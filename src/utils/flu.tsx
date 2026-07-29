// import 'package:darren_walters/app/export.dart';
// import 'package:darren_walters/app/modules/profile/controller/self_mange_fund_controller.dart';
// import 'package:darren_walters/app/modules/profile/model/data_model/answer_data_model.dart';
// import 'package:darren_walters/app/modules/profile/model/data_model/question_data_model.dart';
// import 'package:darren_walters/app/modules/profile/model/question_answer_model.dart';
// import 'package:darren_walters/app/modules/profile/model/question_response_model.dart';
// import 'package:darren_walters/app/modules/profile/model/request_model/question_request_model.dart';

// class BasicInformationFirstController extends BaseController {
//   RxInt selectedLinkCategoryIndex = 0.obs;
//   RxInt typeStatus = typeOnline.obs;
//   RxBool isFollow = false.obs;
//   QuestionRequestModel questionModel = QuestionRequestModel();
//     RxList<QuestionRequestModel> questionList = RxList.empty();
//   bool isMainLoading = false;
//   bool isLoading = false;
//   final Repository _repository = Get.find<Repository>();
//   QuestionListResponseModel questionListResponseModel =
//         QuestionListResponseModel();
//     List<QuestionDataModel> mainQuestionList = [];
//     List<QuestionDataModel> allQuestionList = [];
//   CustomLoader customLoader = CustomLoader();
//   bool isUserAlredyFilledForm = false;
//   bool isRequestHit = false;

//     @override
//   void onInit() {
//         //_initData();
//         _questionListApiCall();
//         super.onInit();
//     }

//     _questionListApiCall() {
//         isMainLoading = true;
//         Map < String, dynamic > queryParams =
//         QuestionRequesPayload.questionRequestPayload(type: "basic", step: "1");
//         _repository
//             .questionListApiCall(queryParameters: queryParams)
//             .then((value) async {
//                 isMainLoading = false;
//                 if(value != null) {
//             questionListResponseModel = value as QuestionListResponseModel;
//             allQuestionList = questionListResponseModel.data ?? [];
//             allQuestionList.first.answer?.forEach((element) {
//                 if (element.selected == true) {
//                     isUserAlredyFilledForm = true;
//                 }
//             });
//             mainQuestionList
//                 .add(questionListResponseModel.data?.first ?? QuestionDataModel());

//             alredyFillData();
//             update();
//         }
//     }).onError((error, stackTrace) {
//         isMainLoading = false;
//         showToast(message: error.toString());
//     });
//   }

// alredyFillData() {
//     answerTypeSelected(mainQuestionList.first);
// }

// answerTypeSelected(QuestionDataModel questionDataModel) {
//     // if alredy save data then show save data accoridng to type
//     switch (questionDataModel.answerType) {
//         case typeSingleSelect:
//             var selectedItem;
//             questionDataModel.answer?.forEach((element) {
//                 if (element.selected == true) {
//                     questionDataModel.isComplete = true;
//                     selectedItem = element;
//                     questionDataModel.selectedIndex =
//                         questionDataModel.answer?.indexOf(element);
//                 }
//             });
//             if (selectedItem == null) {
//                 break;
//             }
//             alredyFilledSingleSelection(
//                 questionModel: questionDataModel,
//                 answerId: selectedItem.sId,
//                 answerModel: selectedItem,
//                 parentIndex: mainQuestionList.indexOf(questionDataModel));
//             break;

//         case typeMultipleSelect:
//             questionDataModel.answer?.forEach((element) {
//                 if (element.selected == true) {
//                     alredyFilledMutlipleSelection(
//                         questionModel: questionDataModel,
//                         answerId: element.sId,
//                         answerModel: element,
//                         parentIndex: mainQuestionList.indexOf(questionDataModel));
//                 }
//             });

//             var data = questionDataModel.answer
//                 ?.where((element) => element.selected == true);
//             if (data?.length == 0) {
//                 questionDataModel.isComplete = false;
//             } else {
//                 questionDataModel.isComplete = true;
//             }

//             break;

//         case typeLocationBox:
//             questionDataModel.locationAnsewer?.clear();
//             questionDataModel.userAnswer?.answers?.forEach((element) {
//                 questionDataModel.isComplete = true;
//                 questionDataModel.locationAnsewer?.add(element);
//             });

//             break;

//         case typeText:
//             questionDataModel.locationAnsewer?.clear();

//             questionDataModel.isComplete = true;
//             questionDataModel.freeEditText?.text =
//                 questionDataModel.userAnswer?.answers?.first ?? "";

//             break;
//     }
// }

// /* if type is Single Selection then load next question*/

// alredyFilledSingleSelection(
//     {
//         required QuestionDataModel questionModel,
//         required answerId,
//         required int parentIndex,
//         required AnswerDataModel answerModel
//     }) {
//     mainQuestionList.removeWhere(
//         (element) => mainQuestionList.indexOf(element) > parentIndex);
//     for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
//         for (int j = 0; j < allQuestionList.length; j++) {
//             if (answerModel.nextQuestionIds![i].toString() ==
//                 allQuestionList[j].sId.toString()) {
//                 var selectedItem;
//                 allQuestionList[j].answer?.forEach((element) {
//                     if (element.selected == true) {
//                         selectedItem = element;
//                         allQuestionList[j].selectedIndex =
//                             allQuestionList[j].answer?.indexOf(element);
//                         allQuestionList[j].isComplete = true;
//                     }
//                 });
//                 mainQuestionList.add(allQuestionList[j]);
//                 answerTypeSelected(allQuestionList[j]);
//             }
//         }
//     }
//     buttonEnable();
//     update();
// }

// /* if type is multiple selection then load next questions*/

// alredyFilledMutlipleSelection(
//     {
//         required QuestionDataModel questionModel,
//         required answerId,
//         required int parentIndex,
//         required AnswerDataModel answerModel
//     }) {
//     if (answerModel.isForm == true) {
//         if (answerModel.selected == false) {
//             mainQuestionList
//                 .removeWhere((element) => element.answerType == typeFormField);
//         } else {
//             //addFromQuestions
//             mainQuestionList.add(QuestionDataModel(
//                 answerType: typeFormField,
//                 formHeading: answerModel.formHeading,
//                 formObject: answerModel));
//         }
//         update();
//         return;
//     }
//     if (answerModel.selected == false) {
//         if (answerModel.answer?.toLowerCase().toString() == "cash out") {
//             mainQuestionList.removeWhere(
//                 (element) => mainQuestionList.indexOf(element) > parentIndex);
//         } else {
//             for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
//                 for (int j = 0; j < mainQuestionList.length; j++) {
//                     if (answerModel.nextQuestionIds![i].toString() ==
//                         mainQuestionList[j].sId.toString()) {
//                         answerModel.selected = false;
//                         mainQuestionList.removeAt(j);
//                     }
//                 }
//             }
//         }
//     } else {
//         for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
//             for (int j = 0; j < allQuestionList.length; j++) {
//                 if (answerModel.nextQuestionIds![i].toString() ==
//                     allQuestionList[j].sId.toString()) {
//                     var alredyLocationBoxPresent = false;
//                     var alredyLocationBoxExist = mainQuestionList
//                         .where((element) => element.answerType == typeLocationBox);
//                     if (alredyLocationBoxExist.length != 0) {
//                         alredyLocationBoxPresent = true;
//                     }
//                     if (alredyLocationBoxPresent == true) {
//                         if (allQuestionList[j].answerType != typeLocationBox) {
//                             mainQuestionList.add(allQuestionList[j]);
//                         }
//                     } else {
//                         mainQuestionList.add(allQuestionList[j]);
//                     }
//                     answerTypeSelected(allQuestionList[j]);
//                 }
//             }
//         }
//     }
//     buttonEnable();
//     update();
// }

// /*add question for single selection without save data*/

// addQuestionsFromList(
    // {
    //     required QuestionDataModel questionModel,
    //     required answerId,
    //     required int parentIndex,
    //     required AnswerDataModel answerModel
    // }) {
    // mainQuestionList.removeWhere(
    //     (element) => mainQuestionList.indexOf(element) > parentIndex);
    // for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
    //     for (int j = 0; j < allQuestionList.length; j++) {
    //         if (answerModel.nextQuestionIds![i].toString() ==
    //             allQuestionList[j].sId.toString()) {
    //             if (isUserAlredyFilledForm == false) {
    //                 answerModel.selected = false;
    //                 allQuestionList[j].selectedIndex = -1;
    //                 allQuestionList[j].controller?.clear();
    //                 allQuestionList[j].isComplete = false;
    //                 allQuestionList[j].freeEditText?.clear();
    //                 allQuestionList[j].locationAnsewer?.clear();
    //                 allQuestionList[j].answer?.forEach((element) {
    //                     element.selected = false;
    //                 });
    //             }
    //             mainQuestionList.add(allQuestionList[j]);
    //             if (isUserAlredyFilledForm == true) {
    //                 answerTypeSelected(mainQuestionList.last);
    //             }
    //         }
    //     }
    // }
    // update();
// }

// addMultipleSelectionAnswer(
//     {
//         required QuestionDataModel questionModel,
//         required answerId,
//         required int parentIndex,
//         required AnswerDataModel answerModel
//     }) {
//     if (answerModel.isForm == true) {
//         if (answerModel.selected == false) {
//             mainQuestionList
//                 .removeWhere((element) => element.answerType == typeFormField);
//         } else {
//             //addFromQuestions
//             mainQuestionList.add(QuestionDataModel(
//                 answerType: typeFormField,
//                 formHeading: answerModel.formHeading,
//                 formObject: answerModel));
//         }
//         update();
//         return;
//     }
//     if (answerModel.selected == false) {
//         if (answerModel.answer?.toLowerCase().toString() == "cash out") {
//             mainQuestionList.removeWhere(
//                 (element) => mainQuestionList.indexOf(element) > parentIndex);
//         } else {
//             for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
//                 for (int j = 0; j < mainQuestionList.length; j++) {
//                     if (answerModel.nextQuestionIds![i].toString() ==
//                         mainQuestionList[j].sId.toString()) {
//                         answerModel.selected = false;
//                         mainQuestionList.removeAt(j);
//                     }
//                 }
//             }
//         }
//     } else {
//         for (int i = 0; i < answerModel.nextQuestionIds!.length; i++) {
//             for (int j = 0; j < allQuestionList.length; j++) {
//                 if (answerModel.nextQuestionIds![i].toString() ==
//                     allQuestionList[j].sId.toString()) {
//                     var alredyLocationBoxPresent = false;
//                     var alredyLocationBoxExist = mainQuestionList
//                         .where((element) => element.answerType == typeLocationBox);
//                     if (alredyLocationBoxExist.length != 0) {
//                         alredyLocationBoxPresent = true;
//                     }
//                     allQuestionList[j].selectedIndex = -1;
//                     allQuestionList[j].controller?.clear();
//                     allQuestionList[j].freeEditText?.clear();

//                     allQuestionList[j].locationAnsewer?.clear();
//                     allQuestionList[j].answer?.forEach((element) {
//                         element.selected = false;
//                     });
//                     if (alredyLocationBoxPresent == true) {
//                         if (allQuestionList[j].answerType != typeLocationBox) {
//                             mainQuestionList.add(allQuestionList[j]);
//                         }
//                     } else {
//                         mainQuestionList.add(allQuestionList[j]);
//                     }
//                 }
//             }
//         }
//     }
//     buttonEnable();
//     update();
// }

// buttonEnable() {
//     bool isButtonEnable = false;
//     var data = mainQuestionList.where((element) => element.isComplete == true);
//     if (data.length == mainQuestionList.length) {
//         isButtonEnable = true;
//     } else {
//         isButtonEnable = false;
//     }
//     debugPrint("buttonEnable data  $isButtonEnable");
//     return isButtonEnable;
// }

// submitData({ required Function(bool) onDataSucess }) {
//     List firstSetpData = [];
//     for (int i = 0; i < mainQuestionList.length; i++) {
//         var data = answerDatFormat(mainQuestionList[i]);

//         firstSetpData.add(data);
//     }
//     Map < String, dynamic > globalDataFromat = Map<String, dynamic>();
//     globalDataFromat['user_answers'] = actualDataFormat(firstSetpData);
//     debugPrint("dataFormatForSending =========>$globalDataFromat");
//     answerSaveApiCall(globalDataFromat, onDataSucess: (data) {
//         onDataSucess(data);
//     });
// }

// answerSaveApiCall(Map < String, dynamic > queryParams,
//     { required Function(bool) onDataSucess }) {
//     isLoading = true;
//     update();

//     _repository.saveAnswerApiCall(requestBody: queryParams).then((value) async {
//         isLoading = false;
//         update();
//       if(value != null) {
//         onDataSucess(true);
//     }
// }).onError((error, stackTrace) {
//     isLoading = false;
//     update();
//     showToast(message: error.toString());
// });
//   }

// actualDataFormat(List firstSetpData) {
//     Map < String, dynamic > dataFormat = Map<String, dynamic>();
//     dataFormat['answers'] = firstSetpData;
//     dataFormat['forms'] = formAnswers();
//     return dataFormat;
// }

// answerDatFormat(QuestionDataModel questionDataModel) {
//     Map < String, dynamic > map = Map<String, dynamic>();
//     map['question_id'] = questionDataModel.sId;
//     map['answers_ids'] = answerType(questionDataModel);
//     map['answers'] = freeEditTextAnswers(questionDataModel);
//     return map;
// }

// formsAnswers(QuestionDataModel questionDataModel) {
//     Map < String, dynamic > map = Map<String, dynamic>();
//     map['question_id'] = questionDataModel.sId;
//     map['answers_ids'] = answerType(questionDataModel);
//     map['answers'] = freeEditTextAnswers(questionDataModel);
//     return map;
// }

// answerType(QuestionDataModel questionDataModel) {
//     switch (questionDataModel.answerType) {
//         case typeSingleSelect:
//         List answerList = [];
//             answerList.add(questionDataModel
//                 .answer![questionDataModel.selectedIndex ?? 0].sId);
//             return answerList;

//         case typeMultipleSelect:
//         List answerList = [];
//             questionDataModel.answer?.forEach((element) {
//                 if (element.selected == true) {
//                     answerList.add(element.sId);
//                 }
//             });
//             return answerList;
//     }
// }

// formAnswers() {
//     var list = [];
//     mainQuestionList.forEach((element) {
//         if (element.answerType == typeFormField) {
//             list.addAll(element.formAnswersForSubmitted ?? []);
//         }
//     });
//     return list;
// }

// freeEditTextAnswers(QuestionDataModel questionDataModel) {
//     switch (questionDataModel.answerType) {
//         case typeLocationBox:
//         List answerList = [];
//             questionDataModel.locationAnsewer?.forEach((element) {
//                 answerList.add(element);
//             });
//             return answerList;
//         case typeLocationBox ||
//             typeText ||
//             typeInterger ||
//             typeYear ||
//             percentage:
//         List answerList = [];
//             answerList.add(questionDataModel.freeEditText?.text);
//             return answerList;
//     }
// }
// }