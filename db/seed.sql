INSERT INTO department (department_name)
VALUES ("Engineering"), ("Marketing and Sales"), ("Accounting and Finance"), ("Legal"), ("Administration");

INSERT INTO role (title, salary, department_id)
VALUES ("Senoir Engineer, 175000, 1"), ("Engineer, 12000, 1"), ("Salesperson, 100000, 2"), ("CFO, 235000, 3"), ("Lead Counsel, 18000, 4"), ("Laywer, 140000, 4"), ("CEO, 250000, 5");

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Boss", "Hog", 5, 1), ("Ned", "Siegfried", 4, 1), ("Junior", "Siegfried", 4, null), ("Uncle", "Pennybags", 3, 1), ("Ron", "Popeil", 2, 1), ("Larry", "Page", 1, 1), ("Mark", "Zuckerberg", 1, null);
