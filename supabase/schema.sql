alter table ideas
  add column author text not null default 'Anonymous',
  add column votes integer not null default 0,
  add column status text not null default 'New'
    check (status in ('New', 'Under review', 'Approved', 'Rejected'));
