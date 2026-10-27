---
id: a-05
baslik: "Injection: why is a single quote so dangerous?"
hedefler:
  - Explain why SQL and NoSQL injection happen
  - Close the flaw with parameterised queries
animasyonlar: [sql-injection]
---

# Injection: why is a single quote so dangerous?

> The server thinks what you typed is **data**. What if what you typed behaves like a **command**?
> 🗂️ **Drawer 5:** This is where Jasmine's name comes from. Today you'll learn to recognise her signature.

::cizgi[a-05-sahne]

## The problem: data and command in the same sentence

![A small extra order appended to the request slip given to the librarian; the robot librarian opens every cabinet](../../gorseller/a-05-b.webp)

```python
sorgu = "SELECT * FROM ogrenciler WHERE ad = '" + girdi + "'"
```

If the input is `Ali`, there's no problem. If the input contains a single **`'`**, the structure of the sentence breaks;
anything written after it becomes part of the SQL. The classic `' OR '1'='1` logic makes the condition always true.

::animasyon[sql-injection]

## Signs (in the lab)

- A **500 error** or a database error message when a single quote is added.
- A normal result on the same search with `'--` → the comment worked.
- A **sudden growth** in response size → extra data is coming back.

## NoSQL isn't exempt either

An operator such as `{"sifre": {"$ne": null}}` in a JSON body means "if the password is not empty" and
can get past the check. The reason is the same: the input changes the **structure** of the query.

## Defence: parameterised queries

![The request and the data are given in two separate boxes; the robot librarian only applies the template form and doesn't take the data out of the box](../../gorseller/a-05-c.webp)

```python
cur.execute("SELECT * FROM ogrenciler WHERE ad = %s", (girdi,))
```

The query and the data travel **separately**; the database never runs the input as a command. Extra layers:

- The ORM's safe methods (instead of raw queries)
- **Least privilege** for the application's database user
- No detailed database errors shown to the user
- In NoSQL, validate the input's type (if text is expected, not an object)

## 🧪 Try it (5 min)

Only on your local Juice Shop: type a single `'` into the email field of the sign-in form.
Inspect the response in Burp. What does the error say? What does that error message teach an attacker?

## ✅ Remember

- Injection = the input changing the structure of the query.
- A parameterised query separates data from command; that is the real fix.
- Detailed error messages give an attacker directions.
