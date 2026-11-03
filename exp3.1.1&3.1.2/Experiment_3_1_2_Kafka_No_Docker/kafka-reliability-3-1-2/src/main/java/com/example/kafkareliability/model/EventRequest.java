package com.example.kafkareliability.model;
public class EventRequest {
 private String eventId,postId,userName,platform,content,scheduledTime,failureMode;
 public String getEventId(){return eventId;} public void setEventId(String v){eventId=v;}
 public String getPostId(){return postId;} public void setPostId(String v){postId=v;}
 public String getUserName(){return userName;} public void setUserName(String v){userName=v;}
 public String getPlatform(){return platform;} public void setPlatform(String v){platform=v;}
 public String getContent(){return content;} public void setContent(String v){content=v;}
 public String getScheduledTime(){return scheduledTime;} public void setScheduledTime(String v){scheduledTime=v;}
 public String getFailureMode(){return failureMode;} public void setFailureMode(String v){failureMode=v;}
}