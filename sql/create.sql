-- 用户
create table if not exists user (
  id text primary key not null,
  name text not null,
  password text not null,
  role integer default 1 check ( role in (0, 1) ) -- 0: 管理员, 1: 普通用户
);
-- 试卷信息
create table if not exists paper_info (
  name text not null unique check ( length(name) > 0 ),    -- 试卷名
  table_name text primary key not null,   -- 数据表名
  create_time integer check ( create_time >= 0 ),    -- 创建时间
  begin_time integer check ( begin_time >= 0 ),   -- 开考时间
  end_time integer check ( end_time >= 0 ),   -- 结束时间
  judge_value integer check ( judge_value > 0 and judge_value <= 100 ),   -- 判断题分值
  choice_value integer check ( choice_value > 0 and choice_value <= 100 ),    -- 单选题分值
  multi_value integer check ( multi_value > 0 and multi_value <= 100),  -- 多选题分值
  short_value integer check ( short_value > 0 and multi_value <= 100 ),   -- 简答题分值
  total_value integer check ( total_value > 0 ),   -- 试卷总分值
  pass_score integer check ( pass_score >= 0 ),   -- 及格分数线
  active integer default 0 check ( active in (0, 1) )   -- 是否启用试卷
);
-- 判断题
create table if not exists judge (
  num integer primary key autoincrement,
  id text not null,
  content text not null unique,
  ans integer check ( ans in (0, 1) ),
  use integer default 1 check ( use in (0, 1) )   -- 是否启用试题
);
-- 选择题
create table if not exists choice (
  num integer primary key autoincrement,
  id text not null,
  content text not null unique,
  c1 text,
  c2 text,
  c3 text,
  c4 text,
  ans text check ( ans in ('1', '2', '3', '4') ),
  use integer default 1 check ( use in (0, 1) )   -- 是否启用试题
);
-- 多项选择题
create table if not exists multi_choice (
  num integer primary key autoincrement,
  id text not null,
  content text not null unique,
  c1 text,
  c2 text,
  c3 text,
  c4 text,
  ans text,
  use integer default 1 check ( use in (0, 1) )   -- 是否启用试题
);
-- 简答题
create table if not exists short_answer (
  num integer primary key autoincrement,
  id text not null,
  content text not null unique,
  ans text,
  use integer default 1 check ( use in (0, 1) )   -- 是否启用试题
);
-- 考试结果
create table if not exists exam_result (
  paper_id text not null, -- 试卷
  user_id text not null, -- 用户id
  content_id text not null, -- 试题
  content_type integer check ( content_type in (0, 1, 2, 3) ),
  ans text, -- 答案
  foreign key (user_id) references user(id) on delete cascade
);
-- 考试开始时间
create table if not exists exam_start (
  user_id text not null,  -- 用户id
  time_client integer not null,  -- 客户端开考时间,
  time_server integer not null,  -- 服务端时间
  foreign key (user_id) references user(id) on delete cascade
);
-- 培训模式答题记录
create table if not exists answer_record (
  user_id text primary key not null,
  judge_num integer check ( judge_num >= 0 ),
  choice_num integer check ( choice_num >= 0 ),
  multi_num integer check ( multi_num >= 0 ),
  short_num integer check ( short_num >= 0 ),
  foreign key (user_id) references user(id) on delete cascade
);
-- 考试成绩
create table if not exists exam_score (
    user_id text not null,
    paper_id text not null,
    judge_score integer not null check ( judge_score >= 0 ),      -- 判断题得分
    choice_score integer not null check ( choice_score >= 0 ),    -- 选择题得分
    multi_score integer not null check ( multi_score >= 0 ),      -- 多选题得分
    short_score integer not null check ( short_score >= 0 ),      -- 简答题得分
    total_score integer not null check ( total_score >= 0 ),      -- 总分
    pass text not null default '不及格' check ( pass in ('不及格', '及格') ),     -- 是否及格
    foreign key (user_id) references user(id) on delete cascade,
    primary key (user_id, paper_id)
);