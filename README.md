# AngularDataTable
Bind Data in the table

# index.html

```html
        <table class="table table-bordered"
        <table class="table table-bordered"
               data-table
               data-list="list"
               data-current-page="0"
               data-page-size="5"
               data-return-action="pageOnChange()"
               data-filter="true"
               data-filter-by="name"
               data-filter-advance="filter"
               data-lang="fa">
            <tbody>
                <tr data-orderby="name" data-asc="false">
                    <td data-header="name" data-binding="name" data-sortable="true"></td>
                    <td data-header="username" data-sortable="true">{{item.username}}</td>
                    <td data-header="actions">
                        {{item.email}}
                        <a href="{{item.id}}">btn</a>
                    </td>
                </tr>
            </tbody>
        </table>
```

# controller.js
```javascript
        var app = angular.module("app", ["dataTable"]);

        app.controller("ctrl", function ($scope, tableService, $http) {
            var root = "http://jsonplaceholder.typicode.com";

            $scope.list = [];

            $http.get(root + "/users").success(function (data) {
                $scope.list = data;
            });

            $scope.pageOnChange = function () {
                console.log(tableService.getAction());
            }
            
            $scope.filter = {
                fields: [
                     { name: "name", filter: true, setup: { title: "name", type: "text" } },
                     { name: "username", filter: false, setup: { title: "username", type: "text" } }
                ]
            }
        });
```

# tableParams

<ul>
  <li>data-table: 'directive name'</li>
  <li>data-list: 'array'</li>
  <li>data-current-page: 'int'</li>
  <li>data-page-size: 'int'</li>
  <li>data-return-action: 'function return tableService.getAction()'</li>
  <li>data-server-side-records: "int" > if this set, pagination numbers will change by server data records length, else pagination number eq array length</li>
  <li>data-filter: 'bool'</li>
  <li>data-filter-by: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-filter-advance: 'model'</li>
  <li>data-lang: "en/fa"</li>
</ul>


# tr Params

default sortBy and orderBy when table start:
<ul>
  <li>data-orderby: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-asc: 'bool'</li>
</ul>


# td Params

default sortBy and orderBy when table start:
<ul>
  <li>data-header: 'header title for each col'</li>
  <li>data-binding: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-sortable: 'bool'</li>
  <li>data-header-source= 'string, what you bind in td for sorting'</li>
</ul>

# td binding
```html
 <td data-header="name" data-binding="name" data-sortable="true"></td>
 <td data-header="username" data-sortable="true">{{item.username}}</td>
 <td data-header="actions">
    {{item.email}}
    <a href="{{item.id}}">btn</a>
  </td>
```

# filter model

```javascript
  var options = [
        { name: "manager", value: 0 },
        { name: "user", value: 1 }
  ];

   $scope.filter = {
        fields: [
                { name: "name", filter: true, setup: { title: "name", type: "text" } },
                { name: "role", filter: true, setup: { title: "role", type: "select", options: options } }
                ]
   }
```
