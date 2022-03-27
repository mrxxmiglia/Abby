const express = require("express");
const router = express.Router();

const DATABASE_API = require("../helper_functions/functions/database_api");
const RESPOSES = require("../helper_functions/data/responses.json");

const format_response = (
  texts,
  buttons,
  OC,
  button_link = "None",
  button_title = "None"
) => {
  let button_object = [];
  let response = {};

  buttons.forEach((button) => {
    button_object.push({
      text: button,
    });
  });

  let text_object = [];

  texts.forEach((text) => {
    text_object.push(text);
  });

  if (buttons.length == 0) {
    response["fulfillmentMessages"] = [
      {
        text: {
          text: text_object,
        },
      },
    ];
  } else if (button_link !== "None") {
    response["fulfillmentMessages"] = [
      {
        payload: {
          richContent: [
            [
              {
                link: button_link,
                text: button_title,
                icon: {
                  type: "chevron_right",
                  color: "#FF9800",
                },
                type: "button",
              },
            ],
          ],
        },
      },
      {
        text: {
          text: text_object,
        },
      },
      {
        payload: {
          richContent: [
            [
              {
                options: button_object,
                type: "chips",
              },
            ],
          ],
        },
      },
    ];
  } else {
    response["fulfillmentMessages"] = [
      {
        text: {
          text: text_object,
        },
      },
      {
        payload: {
          richContent: [
            [
              {
                options: button_object,
                type: "chips",
              },
            ],
          ],
        },
      },
    ];
  }

  if (OC.length != 0) {
    response["outputContexts"] = OC;
  }

  return response;
};

const get_error_message = () => {
  let error_message = format_response(
    ["Something is wrong with backend."],
    [],
    []
  );

  return error_message;
};

const handleDefaultWelcomeIntent = async (req) => {
  let user_token = req.body.originalDetectIntentRequest.payload.userId;
  let response = await DATABASE_API.get_user_profile(user_token);
  console.log("handleDefaultWelcomeIntent + get_user_profile");
  console.log(response);

  if (response.status == 1) {
    let nick_name = response.user_profile.Content.Nickname;
    let texts = RESPOSES["Default Welcome Intent"].texts;
    texts[0] = texts[0].replace("{Nickname}", nick_name);
    let buttons = RESPOSES["Default Welcome Intent"].buttons;
    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let oc = [
      {
        name: session_vars,
        lifespanCount: 100,
        parameters: {
          user_profile: response.user_profile,
        },
      },
    ];
    return format_response(texts, buttons, oc);
  } else {
    return get_error_message();
  }
};

const check_sleep_time = (date) => {
  let startTime = "21:30:00";
  let endTime = "22:30:00";

  currentDate = new Date(Date.parse(date));

  startDate = new Date(currentDate.getTime());
  startDate.setHours(startTime.split(":")[0]);
  startDate.setMinutes(startTime.split(":")[1]);
  startDate.setSeconds(startTime.split(":")[2]);

  endDate = new Date(currentDate.getTime());
  endDate.setHours(endTime.split(":")[0]);
  endDate.setMinutes(endTime.split(":")[1]);
  endDate.setSeconds(endTime.split(":")[2]);

  valid = startDate < currentDate && endDate > currentDate;

  return valid;
};

// Función que requiere las respuestas del usuario

const handleUserProvidesA8 = async (req) => {
  let outputContexts = req.body.queryResult.outputContexts;

  let parameters = {};

  outputContexts.forEach((outputContext) => {
    let session = outputContext.name;
    if (session.includes("/contexts/session_vars")) {
      parameters = outputContext.parameters;
    }
  });

  let user_profile = parameters.user_profile;

  let a_one = parameters.a_one;
  let a_two = parameters.a_two;
  let a_three = parameters.a_three;
  let a_four = parameters.a_four;
  /*let a_five = Number(parameters.a_five);
  let a_six = parameters.a_six;
  let a_seven = parameters.a_seven;
  let a_eight = parameters.a_eight;
  let a_six_med = "";
  if (a_six === "Yes") {
    a_six_med += parameters.a_six_med;
  } else {
    a_six_med += "No medicine.";
  }*/

  //NEW

  let last_conv = parameters.last_conv;

  // Store flag of all the answers
  let result = {
    a_one: true,
    a_two: true,
    a_three: true,
    a_four: true,
    /*a_five: true,
    a_six: true,
    a_seven: true,
    a_eight: true,*/

    // adherido
    last_conv: true,
  };

  // Check all the answers
  let flag = true;
  if (a_one !== "Yes") {
    flag = false;
    result.a_one = false;
  }
  if (a_two !== "Yes") {
    flag = false;
    result.a_two = false;
  }
  if (a_three !== "Yes") {
    flag = false;
    result.a_three = false;
  }
  if (a_four !== "No") {
    flag = false;
    result.a_four = false;
  }

  if (flag) {
    let nick_name = user_profile.Content.Nickname;
    let texts = RESPOSES["User Provides A8 All Correct"].texts;
    texts[0] = texts[0].replace("{Nickname}", nick_name);
    let buttons = RESPOSES["User Provides A8 All Correct"].buttons;
    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_video_confirm = `${session}/contexts/await_video_confirm`;
    let oc = [
      {
        name: await_video_confirm,
        lifespanCount: 1,
      },
      {
        name: session_vars,
        lifespanCount: 100,
        parameters: {
          user_profile: user_profile,
          result: result,
        },
      },
    ];
    return format_response(texts, buttons, oc);
  } else {
    let nick_name = user_profile.Content.Nickname;
    let texts = RESPOSES["User Provides A8 All Not Correct"].texts;
    texts[0] = texts[0].replace("{Nickname}", nick_name);
    let buttons = RESPOSES["User Provides A8 All Not Correct"].buttons;
    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_video_confirm = `${session}/contexts/await_video_confirm`;
    let oc = [
      {
        name: await_video_confirm,
        lifespanCount: 1,
      },
      {
        name: session_vars,
        lifespanCount: 100,
        parameters: {
          user_profile: user_profile,
          result: result,
        },
      },
    ];
    return format_response(texts, buttons, oc);
  }
};

const handleUserConfirmsVideo = (req) => {
  let outputContexts = req.body.queryResult.outputContexts;

  let parameters = {};

  outputContexts.forEach((outputContext) => {
    let session = outputContext.name;
    if (session.includes("/contexts/session_vars")) {
      parameters = outputContext.parameters;
    }
  });

  let user_profile = parameters.user_profile;

  let cources = user_profile.Content.Courses;
  let video_url = "";
  cources.forEach((course) => {
    if (course.Course === "Excercise") {
      video_url += course.URL_VideoSubscriber;
    }
  });

  let nick_name = user_profile.Content.Nickname;
  let button_link = `${user_profile.Content.URL_PWA}${video_url}`;
  let button_title = "See the video here...";
  texts = RESPOSES["User Confirms Video"].texts;
  texts[0] = texts[0].replace("{Nickname}", nick_name);
  let buttons = RESPOSES["User Confirms Video"].buttons;

  let session = req.body.session;
  let await_last_conv = `${session}/contexts/await_last_conv`;
  let session_vars = `${session}/contexts/session_vars`;
  let oc = [
    {
      name: await_last_conv,
      lifespanCount: 1,
    },
    {
      name: session_vars,
      lifespanCount: 100,
      parameters: {
        show_first_message: true,
      },
    },
  ];

  return format_response(texts, buttons, oc, button_link, button_title);
};

const handleUserDeniesVideo = (req) => {
  let outputContexts = req.body.queryResult.outputContexts;

  let parameters = {};

  outputContexts.forEach((outputContext) => {
    let session = outputContext.name;
    if (session.includes("/contexts/session_vars")) {
      parameters = outputContext.parameters;
    }
  });

  let user_profile = parameters.user_profile;
  let result = parameters.result;

  let nick_name = user_profile.Content.Nickname;
  let texts = RESPOSES["User Denies Video"].texts;
  texts[0] = texts[0].replace("{Nickname}", nick_name);
  let buttons = RESPOSES["User Denies Video"].buttons;

  let new_texts = [];
  let new_buttons = [];

  let flag = false;

  if (!result.a_one) {
    new_texts = RESPOSES["A1 Correct"].texts;
    new_buttons = RESPOSES["A1 Correct"].buttons;
    result.a_one = true;
  } else if (!result.a_two) {
    new_texts = RESPOSES["A2 Correct"].texts;
    new_buttons = RESPOSES["A2 Correct"].buttons;
    result.a_two = true;
  } else if (!result.a_seven) {
    new_texts = RESPOSES["A7 Correct"].texts;
    new_buttons = RESPOSES["A7 Correct"].buttons;
    result.a_seven = true;
  } else {
    flag = true;
  }

  if (flag) {
    new_texts = RESPOSES["Hydration"].texts;
    new_buttons = RESPOSES["Hydration"].buttons;

    new_texts.forEach((text) => {
      texts.push(text);
    });

    new_buttons.forEach((button) => {
      buttons.push(button);
    });

    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_confirm_hydration = `${session}/contexts/await_confirm_hydration`;
    let oc = [
      {
        name: session_vars,
        lifespanCount: 0,
      },
      {
        name: await_confirm_hydration,
        lifespanCount: 1,
      },
    ];

    return format_response(texts, buttons, oc);
  } else {
    new_texts.forEach((text) => {
      texts.push(text);
    });

    new_buttons.forEach((button) => {
      buttons.push(button);
    });

    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_last_conv = `${session}/contexts/await_last_conv`;
    let oc = [
      {
        name: session_vars,
        lifespanCount: 100,
        parameters: {
          user_profile: user_profile,
          result: result,
          show_first_message: false,
        },
      },
      {
        name: await_last_conv,
        lifespanCount: 1,
      },
    ];

    return format_response(texts, buttons, oc);
  }
};

const handleLastConversation = (req) => {
  let outputContexts = req.body.queryResult.outputContexts;

  let parameters = {};

  outputContexts.forEach((outputContext) => {
    let session = outputContext.name;
    if (session.includes("/contexts/session_vars")) {
      parameters = outputContext.parameters;
    }
  });

  let user_profile = parameters.user_profile;

  let a_six = parameters.a_six;
  

  let metadata = [
    
    {
      MetadataName: "Daily Walk",
      MetadataValue: parameters.a_one,
    },
    {
      MetadataName: "Weekly HIIT",
      MetadataValue: parameters.a_two,
    },
    {
      MetadataName: "Weekly weightlifting",
      MetadataValue: parameters.a_three,
    },
    {
      MetadataName: "Weekly hyperventilating",
      MetadataValue: parameters.a_four,
    },

    /// metadata del video

    {
      MetadataName: "Video_Useful",
      MetadataValue: parameters.video_useful,
    },
  ];

  let metadata1 = [
    {
      MetadataName: "Sleep_Behavior",
      MetadataValue: parameters.b_time,
    },
    {
      MetadataName: "Sleep_Behavior1",
      MetadataValue: parameters.b_time1,
    },
    {
      MetadataName: "Hydration Behavior",
      MetadataValue: parameters.b_time2,
    },
    {
      MetadataName: "Hydration Behavior2",
      MetadataValue: parameters.b_time3,
    }
  ];

  let user_token = req.body.originalDetectIntentRequest.payload.userId;

  let response1 = DATABASE_API.set_user_metadata(metadata, user_token);
  console.log("handleLastConversation + set_user_metadata");
  console.log(response1);

  let response2 = DATABASE_API.set_list_dailyreport(metadata1, user_token);
  console.log("handleLastConversation + set_user_metadata");
  console.log(response2);

  console.log("continuo con la programación vieja");
  let result = parameters.result;

  let texts = [];
  let buttons = [];
  console.log(
    "comienza IF 01" + parameters.hasOwnProperty("show_first_message")
  );
  if (parameters.hasOwnProperty("show_first_message")) {
    if (parameters.show_first_message) {
      let nick_name = user_profile.Content.Nickname;
      let this_texts = RESPOSES["User Denies Video"].texts;
      this_texts.forEach((text) => {
        if (text.includes("{Nickname}")) {
          texts.push(text.replace("{Nickname}", nick_name));
        } else {
          texts.push(text);
        }
      });
      let this_buttons = RESPOSES["User Denies Video"].buttons;
      this_buttons.forEach((button) => {
        buttons.push(button);
      });
    }
  }
  console.log("terminé con el IF01");
  let new_texts = [];
  let new_buttons = [];
  console.log("comienzo con el IF02");
  if (!result.a_one || result.a_one) {
    new_texts = RESPOSES["A1 Correct"].texts;
    new_buttons = RESPOSES["A1 Correct"].buttons;
    result.a_one = true;
  } /*else if (!result.a_three) {
    new_texts = RESPOSES["A3 Correct"].texts;
    new_buttons = RESPOSES["A3 Correct"].buttons;
    result.a_three = true;
  } else if (!result.a_four) {
    new_texts = RESPOSES["A4 Correct"].texts;
    new_buttons = RESPOSES["A4 Correct"].buttons;
    result.a_four = true;
  } else if (!result.a_five) {
    new_texts = RESPOSES["A5 Correct"].texts;
    new_buttons = RESPOSES["A5 Correct"].buttons;
    result.a_five = true;
  } else if (!result.a_six) {
    new_texts = RESPOSES["A6 Correct"].texts;
    new_buttons = RESPOSES["A6 Correct"].buttons;
    result.a_six = true;
  }*/
  console.log("terminé con el IF02");

  console.log("comienzo con el IF03");

  if (new_texts.length == 0 && new_buttons.length == 0) {
    new_texts = RESPOSES["Hydration"].texts;
    new_buttons = RESPOSES["Hydration"].buttons;

    new_texts.forEach((text) => {
      texts.push(text);
    });

    new_buttons.forEach((button) => {
      buttons.push(button);
    });

    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_confirm_hydration = `${session}/contexts/await_confirm_hydration`;
    let oc = [
      {
        name: session_vars,
        lifespanCount: 0,
      },
      {
        name: await_confirm_hydration,
        lifespanCount: 1,
      },
    ];

    return format_response(texts, buttons, oc);
  } else {
    new_texts.forEach((text) => {
      texts.push(text);
    });

    new_buttons.forEach((button) => {
      buttons.push(button);
    });

    let session = req.body.session;
    let session_vars = `${session}/contexts/session_vars`;
    let await_last_conv = `${session}/contexts/await_last_conv`;
    let oc = [
      {
        name: session_vars,
        lifespanCount: 100,
        parameters: {
          user_profile: user_profile,
          result: result,
          show_first_message: false,
        },
      },
      {
        name: await_last_conv,
        lifespanCount: 1,
      },
    ];
    console.log("terminé con el IF03");

    console.log("terminé");
    return format_response(texts, buttons, oc);
  }
};

router.post("/dialogflow", async (req, res) => {
  let action = req.body.queryResult.action;
  let session = req.body.session;

  console.log("A new request came.");
  console.log(`Action name -> ${action}`);
  console.log(`Session -> ${session}`);

  let response_data = {};

  if (action === "handleDefaultWelcomeIntent") {
    response_data = await handleDefaultWelcomeIntent(req);
  } else if (action === "handleUserProvidesA8") {
    response_data = await handleUserProvidesA8(req);
  } else if (action === "handleUserConfirmsVideo") {
    response_data = handleUserConfirmsVideo(req);
  } else if (action === "handleUserDeniesVideo") {
    response_data = handleUserDeniesVideo(req);
  } else if (action === "handleLastConversation") {
    response_data = handleLastConversation(req);
  } else {
    response_data[
      "fulfillmentText"
    ] = `No handle is set for the action ${action}`;
  }

  res.send(response_data);
});

module.exports = {
  router,
};
