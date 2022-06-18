insert into "users" ("firstName", "lastName", "email", "password")
values ('DemoUser', 'DemoUser', 'demo@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$3Djy5Rq9yClNhq6tdPxCvg$3iS8jpZ1J5GVfY22q/v8TjD0EjsJ/Sl2TRk27mIjmX0');

insert into "jobList" ("company", "position", "dateApplied", "status", "notes", "userId" )
values ('LearningFuze', 'Software Engineer I', '2022-06-17T00:00:00Z', 'Active', '$40/hr', '1');
