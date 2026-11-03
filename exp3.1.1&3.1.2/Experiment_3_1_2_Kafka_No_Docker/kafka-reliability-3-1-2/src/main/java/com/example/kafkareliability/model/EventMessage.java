package com.example.kafkareliability.model;
public class EventMessage {
 private String eventId,postId,userName,platform,content,scheduledTime,failureMode;
 public EventMessage(){} public EventMessage(String a,String b,String c,String d,String e,String f,String g){eventId=a;postId=b;userName=c;platform=d;content=e;scheduledTime=f;failureMode=g;}
 public String getEventId(){return eventId;} public String getPostId(){return postId;} public String getUserName(){return userName;} public String getPlatform(){return platform;} public String getContent(){return content;} public String getScheduledTime(){return scheduledTime;} public String getFailureMode(){return failureMode;}
 public void setEventId(String v){eventId=v;} public void setPostId(String v){postId=v;} public void setUserName(String v){userName=v;} public void setPlatform(String v){platform=v;} public void setContent(String v){content=v;} public void setScheduledTime(String v){scheduledTime=v;} public void setFailureMode(String v){failureMode=v;}
}