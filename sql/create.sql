-- 用户
create table if not exists user (
  name text not null,
  password text not null
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
  id text primary key not null,
  content text not null unique,
  ans integer check ( ans in (0, 1) )
);
-- 选择题
create table if not exists choice (
  id text primary key not null,
  content text not null unique,
  c1 text,
  c2 text,
  c3 text,
  c4 text,
  ans text check ( ans in ('1', '2', '3', '4') )
);
-- 多项选择题
create table if not exists multi_choice (
  id text primary key not null,
  content text not null unique,
  c1 text,
  c2 text,
  c3 text,
  c4 text,
  ans text
);
-- 简答题
create table if not exists short_answer (
  id text primary key not null,
  content text not null unique,
  ans text
);